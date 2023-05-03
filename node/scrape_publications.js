import { get_publications } from "./lib/chambers_api.mjs";
import {
  get_guides,
  get_guide,
  save_guide,
  get_publication,
  save_publication,
} from "./lib/dynamo.mjs";
import { render_guides_json } from "./lib/render_guides.mjs";
import { upload } from "./lib/s3.mjs";

const scrape_publication = async (pub) => {
  console.log(pub.description);
  let updated = false;

  const guide = await get_guide(pub.publicationTypeId);
  if (!guide) {
    const new_guide = {
      created_at: new Date().toISOString(),
      publicationTypeId: pub.publicationTypeId,
      publicationTypeDescription: pub.publicationTypeDescription,
      publicationTypeGroupId: pub.publicationTypeGroupId,
    };
    console.log("Adding new guide", new_guide);
    await save_guide(new_guide);
    updated = true;
  }

  const publication = await get_publication(pub.id);
  if (!publication) {
    const custom = {
      created_at: new Date().toISOString(),
      feedback_scraped: false,
      lawyers_scraped: false,
      research_complete: false,
      schedule_scraped: false,
      scraped_firms: false,
      scraped_lawyers: false,
    };
    console.log("Adding new publication", { ...pub, ...custom });
    await save_publication({ ...pub, ...custom });
    updated = true;
  }

  return updated;
};

const run = async () => {
  console.time("publications");
  const pubs = await get_publications();
  let updated = false;

  // iterate through publications
  for (const pub of pubs) {
    updated = scrape_publication(pub) || updated;
  }

  if (updated) {
    const guides = await get_guides();

    // render output
    const output = await render_guides_json(guides);

    // upload to S3
    await upload(`guides.json`, output);
    console.log("Updated guides.json");
  }

  console.timeEnd("publications");
};

run();
