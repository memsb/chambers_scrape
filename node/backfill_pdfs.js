import fs from "fs";
import { get_pdf, add_pdf } from "./lib/dynamo.mjs";
import { download_pdf } from "./lib/chambers_api.mjs";

(async () => {
  const files = ["366", "384", "423", "483"];
  for (const filename of files) {
    const contents = fs.readFileSync(`pdfs/${filename}`);
    const data = JSON.parse(contents);
    for (const download of data.files) {
      const response = await download_pdf(download.uri, '');
      console.log(response);
    }
  }
})().catch(console.error);
