import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const fetchAlerts = async () => {
  const response = await axios.get(`${BASE_URL}/alerts`);
  return response.data;
};
