import {
  get_locations,
  get_practise_areas,
  get_subsections,
  get_firm_rankings,
} from "./lib/chambers_api.mjs";
import {
  get_firm,
  save_firm,
  get_unscraped_publications,
  set_publication_scraped,
  get_guide,
} from "./lib/dynamo.mjs";
import { render_firms_json } from "./lib/render_firms.mjs";
import { upload } from "./lib/s3.mjs";

const scrape_firms_for_guide = async (guide_id, year) => {
  for (const location of await get_locations(guide_id)) {
    for (const practise of await get_practise_areas(guide_id, location.id)) {
      const subsection = await get_subsections(
        guide_id,
        location.id,
        practise.id,
        practise.subsectionTypeId
      );
      const area = subsection.subsection;
      const ranked = await get_firm_rankings(area.id);
      if (ranked) {
        for (const category of ranked.categories) {
          for (const data of category.organisations) {
            const firm = await get_firm(data, guide_id);

            // Add new subsection
            if (!(area.id in firm.ranking)) {
              firm.ranking[area.id] = {
                locationId: area.locationId,
                locationDescription: area.locationDescription,
                practiceAreaId: area.practiceAreaId,
                practiceAreaDescription: area.practiceAreaDescription,
                history: {},
              };
            }

            // Update ranking history
            if (!(year in firm.ranking[area.id].history)) {
              firm.ranking[area.id].history[year] = rank;

              // save to DB
              await save_firm(firm);
            }
          }
        }
      }
    }
  }
};

const run = async () => {
  console.time("firms");
  const pubs = await get_unscraped_publications("scraped_firms");

  // iterate through unscraped publications
  for (const pub of pubs) {
    console.log(pub.description);

    // get guide of publication
    const guide = await get_guide(pub.publicationTypeId);

    // scrape API
    await scrape_firms_for_guide(guide.publicationTypeId, pub.issueOrYear);

    // render output
    const output = await render_firms_json(guide.publicationTypeId);

    // upload to S3
    await upload(`firms/${guide.publicationTypeId}.json`, output);

    // set publication as scraped
    await set_publication_scraped(pub, "scraped_firms");
  }

  console.timeEnd("firms");
};

run();
