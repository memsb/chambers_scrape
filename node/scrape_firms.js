import {
  get_locations,
  get_practise_areas,
  get_firm_rankings,
} from "./lib/chambers_api.mjs";
import {
  get_firm,
  save_firm,
  new_firm,
  get_unscraped_publications,
  set_publication_scraped,
  get_guide,
} from "./lib/dynamo.mjs";
import { render_firms_json } from "./lib/render_firms.mjs";
import { upload } from "./lib/s3.mjs";

const scrape_firms_for_guide = async (guide_id, year) => {
  for (const location of await get_locations(guide_id)) {
    console.log(` ${location.description}`);

    for (const practise of await get_practise_areas(guide_id, location.id)) {
      const section_id = `${practise.id}:${location.id}:${practise.subsectionTypeId}`;
      const ranked = await get_firm_rankings(section_id);
      if (ranked) {
        for (const category of ranked.categories) {
          const rank = category.description;
          for (const data of category.organisations) {
            let firm = await get_firm(data, guide_id);

            if (!firm) {
              firm = new_firm(data, guide_id);
            }

            // Add new subsection
            if (!(section_id in firm.ranking)) {
              firm.ranking[section_id] = {
                locationId: location.id,
                locationDescription: location.description,
                practiceAreaId: practise.id,
                practiceAreaDescription: practise.description,
                history: {},
              };
            }

            // Update ranking history
            if (!(year in firm.ranking[section_id].history)) {
              firm.ranking[section_id].history[year] = rank;

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
