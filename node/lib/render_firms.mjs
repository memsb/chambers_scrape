import { get_firms_for_guide } from "./dynamo.mjs";
import Handlebars from "handlebars";
import fs from "fs-extra";

const get_years = (data) => {
  const years = {};
  for (const firm of data) {
    for (const [key, section] of Object.entries(firm.ranking)) {
      for (const [year, rank] of Object.entries(section.history)) {
        if (year in years) {
          if (!years[year].includes(rank)) {
            years[year].push(rank);
            years[year].sort();
          }
        }else{
          years[year] = [rank];
        }
      }
    }
  }

  return years;
};

export const render_firms = async (guide_id, publication) => {
  const contents = fs.readFileSync("templates/firms.hjs", "utf8");
  const template = Handlebars.compile(contents);

  const data = await get_firms_for_guide(guide_id);
  const years = get_years(data);

  const rows = [];
  for (const firm of data) {
    for (const [key, section] of Object.entries(firm.ranking)) {
      const history = {};
      for (const year of years) {
        history[year] = year in section.history ? section.history[year] : "";
      }
      rows.push({
        id: firm.id,
        firm: firm.name,
        location: section.locationDescription,
        practice: section.practiceAreaDescription,
        history,
      });
    }
  }
  return template({ publication, years, rows });
};

export const render_firms_json = async (guide_id) => {
  const data = await get_firms_for_guide(guide_id);
  const years = get_years(data);

  const firms = [];
  for (const firm of data) {
    for (const [key, section] of Object.entries(firm.ranking)) {
      const history = {};
      for (const year of Object.keys(years)) {
        history[year] = year in section.history ? section.history[year] : "";
      }
      firms.push({
        id: firm.id,
        firm: firm.name,
        location: section.locationDescription,
        practice: section.practiceAreaDescription,
        history,
      });
    }
  }
  return JSON.stringify(
    {
      firms,
      years,
    },
    null,
    2
  );
};

export const render_index = async (guides) => {
  const contents = fs.readFileSync("templates/firms_index.hjs", "utf8");
  const template = Handlebars.compile(contents);

  guides.sort((a, b) => a.publicationTypeId - b.publicationTypeId);;

  return template({ guides });
};
