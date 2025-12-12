import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default async function getCountries() {
  try {
    const response = await axios.get(`${BASE_URL}/countries`);
    return response.data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }
}
