import {
  get_locations,
  get_practise_areas,
  get_subsections,
  get_individual_rankings,
} from "./lib/chambers_api.mjs";
import {
  get_individual,
  save_individual,
  get_unscraped_publications,
  set_publication_scraped,
  get_guide,
  new_lawyer,
  get_publication,
} from "./lib/dynamo.mjs";
import { render_lawyers_json } from "./lib/render_lawyers.mjs";
import { upload } from "./lib/s3.mjs";
import { create_movers_report } from "./lib/movers_email.mjs";

const scrape_lawyers_for_guide = async (guide_id, year) => {
  let movers = [];

  for (const location of await get_locations(guide_id)) {
    console.log(` ${location.description}`);

    for (const practise of await get_practise_areas(guide_id, location.id)) {
      const section_id = `${practise.id}:${location.id}`;
      const subsections = await get_subsections(guide_id, location.id, practise.id, practise.subsectionTypeId);
      for (const ranked of await get_individual_rankings(subsections.subsection.id)) {
        for (const category of ranked.categories) {
          const rank = category.description;
          for (const data of category.individuals) {
            let individual = await get_individual(data, guide_id);

            if (!individual) {
              individual = new_lawyer(data, guide_id);
            }

            // Add new subsection
            if (!(section_id in individual.ranking)) {
              individual.ranking[section_id] = {
                locationId: location.id,
                locationDescription: location.description,
                practiceAreaId: practise.id,
                practiceAreaDescription: practise.description,
                history: {},
              };
            }

            // Update ranking history
            if (!(year in individual.ranking[section_id].history)) {
              individual.ranking[section_id].history[year] = rank;

              // save to DB
              await save_individual(individual);
            }

            // Update lawyers details
            if (individual.firm !== data.organisationName) {
              movers.push({
                name: individual.name,
                previous: individual.firm,
                current: data.organisationName
              });

              individual.firm = data.organisationName;

              // save to DB
              await save_individual(individual);
            }
          }
        }
      }
    }
  }

  return movers;
};

const run = async () => {
  console.time("lawyers");

  const pubs = await get_unscraped_publications("scraped_lawyers");

  // iterate through unscraped publications
  for (const pub of pubs) {
    console.log(pub.description);

    // get guide of publication
    const guide = await get_guide(pub.publicationTypeId);

    // scrape API
    const movers = await scrape_lawyers_for_guide(guide.publicationTypeId, pub.issueOrYear);

    // render output
    const output = await render_lawyers_json(guide.publicationTypeId);

    // upload to S3
    await upload(`lawyers/${guide.publicationTypeId}.json`, output);

    // set publication as scraped
    await set_publication_scraped(pub, "scraped_lawyers");

    // Email out list of lawyers who have moved firm
    if (pub.publicationTypeId == 5) {
      create_movers_report(pub.description, movers);
    }
  }

  console.timeEnd("lawyers");
};

run();
