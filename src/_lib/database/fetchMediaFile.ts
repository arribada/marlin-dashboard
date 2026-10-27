import { fetchDB } from "./client";

export async function fetchMediaFile(id: string, type: "video" | "audio") {
  try {
    const data = await fetchDB(`/${type}`, { file_id: id });
    return data[type].file_path as string;
  } catch (error) {
    console.error(`[fetchMediaFile] Failed to fetch ${type} ${id}:`, error);
    throw error;
  }
}
