import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getAllMembers(offset = 0, filters = {}, limit = 100) {
  try {
    const response = await axios.post(
      `${BASE_URL}/members?offset=${offset}&limit=${limit}`,
      {
        include: { ...filters },
        exclude: {},
      },
    );
    console.log(response.data.response);
    return response.data.response;
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
}
