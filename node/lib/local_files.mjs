import fs from 'fs-extra';

export const get_locations = async (guide_id, year) => {
  const data = fs.readFileSync(`./data/${guide_id}/${year}/locations.json`);
  return JSON.parse(data);
};

export const get_practise_areas = async (guide_id, year, location_id) => {
  const data = fs.readFileSync(`./data/${guide_id}/${year}/${location_id}/practises.json`);
  return JSON.parse(data);
};

export const get_subsections = async (guide_id, year, location_id, practise_id) => {
  const data = fs.readFileSync(`./data/${guide_id}/${year}/${location_id}/${practise_id}/subsections.json`);
  return JSON.parse(data);
};

export const get_firm_rankings = async (guide_id, year, location_id, practise_id) => {
  const data = fs.readFileSync(`./data/${guide_id}/${year}/${location_id}/${practise_id}/ranked-organisations`);
  return JSON.parse(data);
};

export const get_individual_rankings = async (guide_id, year, location_id, practise_id) => {
  const data = fs.readFileSync(`./data/${guide_id}/${year}/${location_id}/${practise_id}/ranked-individuals`);
  return JSON.parse(data);
};