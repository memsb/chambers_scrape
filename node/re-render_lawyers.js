  import {
    get_guides,
  } from "./lib/dynamo.mjs";
  import { render_lawyers } from "./lib/render_lawyers.mjs";
  import { upload } from "./lib/s3.mjs";
  import fs from "fs-extra";
  
  const run = async () => {
    const guides = await get_guides();
  
    // iterate through unscraped publications
    for (const guide of guides) {
      console.log(guide.publicationTypeDescription);

      // render output
      const output = await render_lawyers(
        guide.publicationTypeId,
        guide.publicationTypeDescription
      );
  
      // upload to S3
      fs.writeFileSync(`output/lawyers/${guide.publicationTypeDescription}.html`, output);
      await upload(`lawyers/${guide.publicationTypeDescription}.html`, output);
  
    }
  };
  
  run();
  