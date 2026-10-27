interface BaseFile {
  id: string;
  name: string;
  type: string;
  start: string; // ISO 8601
  vessel_id: string;
}

// Audio and video files are stored in Azure — they have a location
export interface MediaFile extends BaseFile {
  filepath: string;
  share_name: string;
}

// Transcripts are stored as text in the database — no Azure location
export interface TranscriptFile extends BaseFile {
  transcript_content: string;
}
