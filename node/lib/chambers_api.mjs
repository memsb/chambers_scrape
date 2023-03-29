import axios from "axios";
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

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

export const get_subsections = async (guide_id, location_id, practise_id, subsection_type_id) => {
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