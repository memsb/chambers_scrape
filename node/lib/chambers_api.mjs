import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

export const get_publications = async () => {
  const url = "https://api.chambers.com/api/publications";
  let response = await axios.get(url);
  return response.data;
};

export const get_locations = async (guide_id) => {
  const url = `https://api.chambers.com/api/publications/${guide_id}/locations`;
  let response = await axios.get(url);
  return response.data;
};

export const get_practise_areas = async (guide_id, location_id) => {
  const url = `https://api.chambers.com/api/publications/${guide_id}/locations/${location_id}/practiceareas`;
  let response = await axios.get(url);
  return response.data;
};

export const get_subsections = async (
  guide_id,
  location_id,
  practise_id,
  subsection_type_id
) => {
  const url = `https://ranking-tables.chambers.com/api/subsections/info?groupId=${guide_id}&practiceareaId=${practise_id}&locationId=${location_id}&subsectiontypeId=${subsection_type_id}`;
  let response = await axios.get(url);
  return response.data;
};

export const get_firm_rankings = async (section_id) => {
  const url = `https://ranking-tables.chambers.com/api/subsections/${section_id}/ranked-organisations`;
  let response = await axios.get(url);
  return response.data;
};

export const get_individual_rankings = async (section_id) => {
  const url = `https://ranking-tables.chambers.com/api/subsections/${section_id}/ranked-individuals`;
  let response = await axios.get(url);
  return response.data;
};

export const get_research_for_guide = async (
  guide_id,
  page_size = 30,
  skip = 0
) => {
  const data = {
    guideTypes: [guide_id],
    practiceAreas: [],
    locations: [],
    statuses: [],
    submissionDeadlines: [],
    take: page_size,
    skip: skip,
  };
  const url =
    "https://research-schedule-api.chambers.com/api/research-schedules/search";
  const response = await axios.post(url, data);
  const result = response.data;

  return result;
};

export const get_all_research_for_guide = async (guide_id) => {
  let items = [];
  const page_size = 30;
  let skip = 0;
  let totalItems = 0;

  do {
    const result = await get_research_for_guide(guide_id, page_size, skip);

    items = items.concat(result.data);
    totalItems = result.resultCount;
    skip += page_size;
  } while (items.length < totalItems);

  return items;
};

export const get_research_details = async (research_id) => {
  const url = `https://research-schedule-api.chambers.com/api/research-schedules/${research_id}/details`;
  let response = await axios.get(url);
  return response.data;
};

export const get_researching_guides = async () => {
  const url =
    "https://research-schedule-api.chambers.com/api/publications/types";
  let response = await axios.get(url);
  return response.data;
};
