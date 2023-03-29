import { get_laywers_for_guide } from "./dynamo.mjs";
import Handlebars from "handlebars";
import fs from "fs-extra";

const get_years = (data) => {
  const years = new Set();
  for (const lawyer of data) {
    for (const [key, section] of Object.entries(lawyer.ranking)) {
      for (const [year, rank] of Object.entries(section.history)) {
        if (!(year in years)) {
          years.add(year);
        }
      }
    }
  }
  return Array.from(years).sort();
};

export const render_lawyers = async (guide_id, publication) => {
  const contents = fs.readFileSync("templates/lawyers.hjs", "utf8");
  const template = Handlebars.compile(contents);

  const data = await get_laywers_for_guide(guide_id);
  const years = get_years(data);

  const rows = [];
  for (const lawyer of data) {
    for (const [key, section] of Object.entries(lawyer.ranking)) {
      const history = {};
      for (const year of years) {
        history[year] = year in section.history ? section.history[year] : "";
      }
      rows.push({
        name: lawyer.name,
        firm: lawyer.firm,
        location: section.locationDescription,
        practice: section.practiceAreaDescription,
        history,
      });
    }
  }
  return template({ publication, years, rows });
};

export const render_lawyers_json = async (guide_id) => {
  const data = await get_laywers_for_guide(guide_id);
  const years = get_years(data);

  const lawyers = [];
  for (const lawyer of data) {
    for (const [key, section] of Object.entries(lawyer.ranking)) {
      const history = {};
      for (const year of years) {
        history[year] = year in section.history ? section.history[year] : "";
      }
      lawyers.push({
        name: lawyer.name,
        firm: lawyer.firm,
        location: section.locationDescription,
        practice: section.practiceAreaDescription,
        history,
      });
    }
  }
  return JSON.stringify(
    {
      lawyers,
      years,
    },
    null,
    2
  );
};

export const render_index = async (guides) => {
  const contents = fs.readFileSync("templates/lawyers_index.hjs", "utf8");
  const template = Handlebars.compile(contents);

  guides.sort((a, b) => a.publicationTypeId - b.publicationTypeId);

  return template({ guides });
};
