const publications = {
  "Asia-Pacific 2022": { guide: 8, year: 2022 },
  "Asia-Pacific 2021": { guide: 8, year: 2021 },
  "Canada Guide, 2022": { guide: 20, year: 2022 },
  "Canada Guide, 2021": { guide: 20, year: 2021 },
  "Chambers Brazil: Contentious, 2021": { guide: 99, year: 2021 },
  "Chambers Brazil: Industries & Sectors, 2021": { guide: 101, year: 2021 },
  "Chambers Brazil: Regions, 2021": { guide: 102, year: 2021 },
  "Chambers Brazil: Transactional, 2021": { guide: 100, year: 2021 },
  "Chambers Europe 2021": { guide: 7, year: 2021 },
  "Chambers HNW 2021": { guide: 21, year: 2021 },
  "Chambers HNW 2020": { guide: 21, year: 2020 },
  "Greater China Region 2022": { guide: 116, year: 2022 },
  "Latin America Guide, 2022": { guide: 9, year: 2022 },
  "Latin America Guide, 2021": { guide: 9, year: 2021 },
  "PA: Alternative Legal Service Providers 2021": { guide: 94, year: 2021 },
  "PA: Crisis & Risk Management 2021": { guide: 108, year: 2021 },
  "PA: FinTech 2022": { guide: 49, year: 2022 },
  "PA: FinTech 2021": { guide: 49, year: 2021 },
  "PA: LawTech 2021": { guide: 74, year: 2021 },
  "PA: Litigation Support 2021": { guide: 58, year: 2021 },
  "PA: Litigation": { guide: 58, year: 2020 },
  "UK Bar, 2022": { guide: 14, year: 2022 },
  "UK Bar, 2021": { guide: 14, year: 2021 },
  "UK Guide, 2022": { guide: 1, year: 2022 },
  "UK Guide, 2021": { guide: 1, year: 2021 },
  "USA Guide, 2021": { guide: 5, year: 2021 },
  "USA Guide, 2020": { guide: 5, year: 2020 },
  "Global Guide, 2022": { guide: 2, year: 2022 },
  "Global Guide 2021": { guide: 2, year: 2021 },
};

import fs from "fs";
import xpath from "xpath";
import { DOMParser } from "@xmldom/xmldom";
import {
  find_lawyer_by_name_and_firm,
  find_lawyer_by_name_firm_and_guide,
  find_lawyer_by_name_and_guide,
  get_guide,
  find_location,
  find_subsection,
  find_practice,
  save_individual,
} from "./lib/dynamo.mjs";

import { render_lawyers } from "./lib/render_lawyers.mjs";
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

const match_lawyer = async (name, firm, guide_id) => {
  let individual = await find_lawyer_by_name_firm_and_guide(
    name,
    firm,
    guide_id
  );

  if (individual) {
    return individual;
  }

  let similar_individual = await find_lawyer_by_name_and_firm(name, firm);
  if (similar_individual) {
    return {
      id: similar_individual.id,
      guide: guide_id,
      name,
      firm,
      ranking: {},
    };
  }

  similar_individual = await find_lawyer_by_name_and_guide(name, guide_id);

  if (similar_individual) {
    return {
      id: similar_individual.id,
      guide: guide_id,
      name,
      firm: similar_individual.firm,
      ranking: similar_individual.ranking,
    };
  }

  return {
    id: new_id(),
    guide: guide_id,
    name,
    firm,
    ranking: {},
  };
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

    const subsection = await find_subsection(
      location.id,
      practice.id,
      guide_id
    );
    if (!subsection) {
      continue;
    }

    const lawyer_bands = xpath.select(
      './/div[@class="lawyers"]/div[@class="band"]',
      practice_area
    );

    for (const lawyer_band of lawyer_bands) {
      const rank = xpath.select("string(.//h4/text())", lawyer_band);
      const lawyers = xpath.select(".//ul/li", lawyer_band);

      for (const lawyer of lawyers) {
        const entry = xpath.select("string(.//text())", lawyer);
        const divider_index = entry.indexOf(",");
        let name = entry.substring(0, divider_index).trim();
        const firm = entry.substring(divider_index + 1).trim();

        if (name.indexOf("QC") !== -1) {
          name = name.replace("QC", "KC");
        }

        let individual = await match_lawyer(name, firm, guide_id);

        // Add new subsection
        if (!(subsection.id in individual.ranking)) {
          individual.ranking[subsection.id] = {
            locationId: subsection.locationId,
            locationDescription: subsection.locationDescription,
            practiceAreaId: subsection.practiceAreaId,
            practiceAreaDescription: subsection.practiceAreaDescription,
            history: {},
          };
        }

        // Update ranking history
        if (!(year in individual.ranking[subsection.id].history)) {
          individual.ranking[subsection.id].history[year] = rank;

          // save to DB
          await save_individual(individual);
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

    const output = await render_lawyers(
      guide.publicationTypeId,
      guide.publicationTypeDescription
    );

    // upload to S3
    await upload(`lawyers/${guide.publicationTypeDescription}.html`, output);
  }
})().catch(console.error);
