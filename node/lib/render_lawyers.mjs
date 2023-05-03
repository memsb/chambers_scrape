import { get_laywers_for_guide } from "./dynamo.mjs";

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

export const render_lawyers_json = async (guide_id) => {
  const data = await get_laywers_for_guide(guide_id);
  const years = get_years(data);

  const lawyers = [];
  for (const lawyer of data) {
    for (const [key, section] of Object.entries(lawyer.ranking)) {
      const history = {};
      for (const year of Object.keys(years)) {
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