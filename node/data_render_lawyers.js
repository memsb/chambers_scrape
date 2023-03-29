import {
    get_guides,
  } from "./lib/dynamo.mjs";
  import { render_lawyers_json } from "./lib/render_lawyers.mjs";
  import { upload } from "./lib/s3.mjs";
  import fs from "fs-extra";
  
  const run = async () => {
    const guides = await get_guides();
  
    // iterate through unscraped publications
    for (const guide of guides) {
      console.log(guide.publicationTypeDescription);

      // render output
      const output = await render_lawyers_json(
        guide.publicationTypeId
      );
  
      // upload to S3
      fs.writeFileSync(`output/lawyers/${guide.publicationTypeId}.json`, output);
      await upload(`lawyers/${guide.publicationTypeId}.json`, output);
  
    }
  };
  
  run();
  