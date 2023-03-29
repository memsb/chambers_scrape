const publications = {
  // "Asia-Pacific 2022": { guide: 8, year: 2022, latest: 2023 },
  // "Asia-Pacific 2021": { guide: 8, year: 2021, latest: 2023 },
  // "Canada Guide, 2022": { guide: 20, year: 2022, latest: 2023 },
  // "Canada Guide, 2021": { guide: 20, year: 2021, latest: 2023 },
  // "Chambers Brazil: Contentious, 2021": { guide: 99, year: 2021, latest: 2022 },
  // "Chambers Brazil: Industries & Sectors, 2021": {
  //   guide: 101,
  //   year: 2021,
  //   latest: 2022,
  // },
  // "Chambers Brazil: Regions, 2021": { guide: 102, year: 2021, latest: 2022 },
  // "Chambers Brazil: Transactional, 2021": {
  //   guide: 100,
  //   year: 2021,
  //   latest: 2022,
  // },
  // "Chambers Europe 2021": { guide: 7, year: 2021, latest: 2023 },
  // "Chambers Europe 2022": { guide: 7, year: 2022, latest: 2023 },
  // "Chambers HNW 2021": { guide: 21, year: 2021, latest: 2022 },
  // "Chambers HNW 2020": { guide: 21, year: 2020, latest: 2022 },
  // "Greater China Region 2022": { guide: 116, year: 2022, latest: 2023 },
  // "Latin America Guide, 2022": { guide: 9, year: 2022, latest: 2023 },
  // "Latin America Guide, 2021": { guide: 9, year: 2021, latest: 2023 },
  // "PA: Alternative Legal Service Providers 2021": {
  //   guide: 94,
  //   year: 2021,
  //   latest: 2022,
  // },
  // "PA: Crisis & Risk Management 2021": { guide: 108, year: 2021, latest: 2022 },
  // "PA: FinTech 2022": { guide: 49, year: 2022, latest: 2023 },
  // "PA: FinTech 2021": { guide: 49, year: 2021, latest: 2023 },
  // "PA: LawTech 2021": { guide: 74, year: 2021, latest: 2022 },
  // "PA: Litigation Support 2021": { guide: 58, year: 2021, latest: 2022 },
  // "PA: Litigation": { guide: 58, year: 2020, latest: 2021 },
  // "UK Bar, 2022": { guide: 14, year: 2022, latest: 2023 },
  // "UK Bar, 2021": { guide: 14, year: 2021, latest: 2023 },
  // "UK Guide, 2022": { guide: 1, year: 2022, latest: 2023 },
  // "UK Guide, 2021": { guide: 1, year: 2021, latest: 2023 },
  // "USA Guide, 2021": { guide: 5, year: 2021, latest: 2022 },
  // "USA Guide, 2020": { guide: 5, year: 2020, latest: 2022 },
  // "Global Guide, 2022": { guide: 2, year: 2022, latest: 2023 },
  // "Global Guide 2021": { guide: 2, year: 2021, latest: 2023 },
};

import fs from "fs";
import xpath from "xpath";
import { DOMParser } from "@xmldom/xmldom";
import {
  find_firm,
  find_firm_by_guide,
  find_location,
  find_practice,
  find_subsection,
  save_firm,
  get_guide,
} from "./lib/dynamo.mjs";
import { render_firms } from "./lib/render_firms.mjs";
import { upload } from "./lib/s3.mjs";

function list_all_files(path) {
  let list = [];
  const files = fs.readdirSync(path);
  files.forEach((file) => {
    let file_stat = fs.lstatSync(`${path}/${file}`);
    if (file_stat.isFile() && file !== "index.html") {
      list.push(`${path}/${file}`);
    }
  });
  return list;
}

const new_id = () => {
  let counter = parseInt(fs.readFileSync("counter.txt", "utf8"));
  counter++;
  fs.writeFileSync("counter.txt", `${counter}`);
  return counter;
};

const scape_location = async (file, guide_id, year) => {
  const rawHtmlString = fs.readFileSync(file, "utf8");
  const tree = new DOMParser().parseFromString(rawHtmlString);

  const location_name = xpath.select(
    "string(/html/body/div/div[2]/h1/text())",
    tree
  );

  console.log(` ${location_name}`);

  const location = await find_location(location_name, guide_id);
  if (!location) {
    return;
  }

  const practice_areas = xpath.select("/html/body/div/div[2]/div", tree);
  for (const practice_area of practice_areas) {
    const practice_name = xpath.select("string(.//h2/text())", practice_area);

    let practice = await find_practice(practice_name);
    if (!practice) {
      continue;
    }

    const subsection = await find_subsection(location.id, practice.id, guide_id);
    if (!subsection) {
      continue;
    }

    console.log(`  ${practice_name}`);

    const firm_bands = xpath.select(
      './/div[@class="orgs"]/div[@class="band"]',
      practice_area
    );

    for (const firm_band of firm_bands) {
      const rank = xpath.select("string(.//h4/text())", firm_band);
      const orgs = xpath.select('.//div[@class="org"]', firm_band);

      for (const org of orgs) {
        const firm_name = xpath.select("string(.//h5/text())", org);

        let firm = await find_firm_by_guide(firm_name, guide_id);

        if (!firm) {
          let similar_firm = await find_firm(firm_name);
          if (similar_firm) {
            firm = {
              id: similar_firm.id,
              name: firm_name,
              guide: guide_id,
              ranking: {},
            };
          }
        }

        if (!firm) {
          firm = {
            id: new_id(),
            name: firm_name,
            guide: guide_id,
            ranking: {},
          };
        }

        // Add new subsection
        if (!(subsection.id in firm.ranking)) {
          firm.ranking[subsection.id] = {
            locationId: subsection.locationId,
            locationDescription: subsection.locationDescription,
            practiceAreaId: subsection.practiceAreaId,
            practiceAreaDescription: subsection.practiceAreaDescription,
            history: {},
          };
        }

        // Update ranking history
        if (!(year in firm.ranking[subsection.id].history)) {
          firm.ranking[subsection.id].history[year] = rank;

          // save to DB
          await save_firm(firm);
        }
      }
    }
  }
};

const scape_publication = async (dir, guide_id, year) => {
  const files = list_all_files(dir);
  for (const file of files) {
    await scape_location(file, guide_id, year);
  }
};

(async () => {
  const folder = "guide_pages";
  for (const [filename, publication] of Object.entries(publications)) {
    console.log(filename);

    await scape_publication(
      `${folder}/${filename}`,
      publication.guide,
      publication.year
    );

    const guide = await get_guide(publication.guide);

    const output = await render_firms(
      guide.publicationTypeId,
      guide.publicationTypeDescription
    );

    // upload to S3
    await upload(`firms/${guide.publicationTypeDescription}.html`, output);
  }
})().catch(console.error);
