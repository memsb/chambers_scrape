import {
    get_guides,
  } from "./lib/dynamo.mjs";
  import { render_firms_json } from "./lib/render_firms.mjs";
  import { upload } from "./lib/s3.mjs";
  import fs from "fs-extra";
  
  const run = async () => {
    const guides = await get_guides();
  
    // iterate through unscraped publications
    for (const guide of guides) {
      console.log(guide.publicationTypeDescription);

      // render output
      const output = await render_firms_json(
        guide.publicationTypeId
      );
  
      // upload to S3
      fs.writeFileSync(`output/firms/${guide.publicationTypeId}.json`, output);
      await upload(`firms/${guide.publicationTypeId}.json`, output);
  
    }
  };
  
  run();
  