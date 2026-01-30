import { GET } from "./api_helper";

export const getList = async (url) => {
  try {
    const response = await GET(url);
    if (response?.status === 200) {
      return response?.data || [];
    }
    return []
  } catch (error) {
    console.log(error);
    return [];
  }
}

export const getDetails = async (url, id) => {
  try {
    const response = await GET(`${url}${id}`);
    if (response?.status === 200) {
      return response?.data || {};
    }
    return {}
  } catch (error) {
    console.log(error);
    return {};
  }
}