import axios from "axios";

const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000/api" ;

export const fetchAlerts = async () => {
  const response = await axios.get(`${BASE_URL}/alerts`);
  return response.data;
};

export const listVideos = async (): Promise<string[]> => {
  const res = await axios.get(`${BASE_URL}/videos/list`);
  return res.data.files ?? [];
};

export const uploadVideos = async (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append("videos", f));
  const res = await axios.post(`${BASE_URL}/videos/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getStreamUrl = (filename?: string) => {
  const base = `${BASE_URL}/detect/stream`;
  return filename ? `${base}?video=${encodeURIComponent(filename)}` : base;
};

export type GridSnapshot = {
  timestamp: string;
  grid_counts: number[][]; // rows x cols counts
  grid_size: { rows: number; cols: number };
  frame: { width: number; height: number };
  people_count: number;
  density_per_sqm: number;
  risk_level: string;
};

export const fetchLatestGrid = async (): Promise<GridSnapshot | null> => {
  const res = await axios.get(`${BASE_URL}/detect/grid`, { validateStatus: () => true });
  if (res.status === 202) return null; // warming up
  return res.data as GridSnapshot;
};
