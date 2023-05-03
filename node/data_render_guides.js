import { get_guides } from "./lib/dynamo.mjs";
import { render_guides_json } from "./lib/render_guides.mjs";
import { upload } from "./lib/s3.mjs";
import fs from "fs-extra";

const run = async () => {
  const guides = await get_guides();

  // render output
  const output = await render_guides_json(guides);

  // upload to S3
  fs.writeFileSync(`output/guides.json`, output);
  await upload(`guides.json`, output);
};

run();
