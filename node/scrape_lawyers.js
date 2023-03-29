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
  get_guides,
} from "./lib/dynamo.mjs";
import { render_lawyers, render_index } from "./lib/render_lawyers.mjs";
import { upload } from "./lib/s3.mjs";

const scrape_lawyers_for_guide = async (guide_id, year) => {
  for (const location of await get_locations(guide_id)) {
    console.log(` ${location.description}`);

    for (const practise of await get_practise_areas(guide_id, location.id)) {
      const subsection = await get_subsections(
        guide_id,
        location.id,
        practise.id,
        practise.subsectionTypeId
      );
      const area = subsection.subsection;
      for (const ranked of await get_individual_rankings(area.id)) {
        for (const category of ranked.categories) {
          for (const data of category.individuals) {
            const individual = await get_individual(data, guide_id);

            // Add new subsection
            if (!(area.id in individual.ranking)) {
              individual.ranking[area.id] = {
                locationId: area.locationId,
                locationDescription: area.locationDescription,
                practiceAreaId: area.practiceAreaId,
                practiceAreaDescription: area.practiceAreaDescription,
                history: {},
              };
            }

            // Update ranking history
            if (!(year in individual.ranking[area.id].history)) {
              individual.ranking[area.id].history[year] = rank;

              // save to DB
              await save_individual(individual);
            }
          }
        }
      }
    }
  }
};

const run = async () => {
  const pubs = await get_unscraped_publications("scraped_lawyers");

  // iterate through unscraped publications
  for (const pub of pubs) {
    console.log(pub.description);

    // get guide of publication
    const guide = await get_guide(pub.publicationTypeId);

    // scrape API
    // await scrape_lawyers_for_guide(guide.publicationTypeId, pub.issueOrYear);

    // render output
    const output = await render_lawyers(
      guide.publicationTypeId,
      guide.publicationTypeDescription
    );

    // upload to S3
    // fs.writeFileSync(`output/lawyers/${guide.publicationTypeDescription}.html`, output);
    await upload(`lawyers/${guide.publicationTypeDescription}.html`, output);

    // set publication as scraped
    await set_publication_scraped(pub, "scraped_lawyers");
  }

  console.log('Lawyers Index');

  // Update index page for all guides
  const guides = await get_guides();
  const index_output = await render_index(guides);

  // upload to S3
  await upload(`lawyers/index.html`, index_output);
};

run();