import { useState, useEffect } from "react";

type MediaType = "video" | "audio" | "transcript";

interface MediaFile {
  id: string;
  name: string;
}

interface UseMediaFilesResult<T extends MediaFile> {
  files: T[];
  selected: T | null;
  setSelected: (file: T) => void;
  loading: boolean;
  error: string | null;
}

export function useMediaFiles<T extends MediaFile>(
  ids: string[] | undefined,
  type: MediaType,
  endpoint: string,
  params?: any
): UseMediaFilesResult<T> {
  const [files, setFiles] = useState<T[]>([]);
  const [selected, setSelected] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ids || ids.length === 0) {
      setFiles([]);
      setSelected(null);
      return;
    }

    const controller = new AbortController();

    async function fetchFiles() {
      setLoading(true);
      setError(null);

      try {
        // Appends query params with the correct separator:
        // - Admin endpoints already include "?" (for vesselId), so we chain with "&"
        // - Fisher endpoints derive vesselId from the token, so we start with "?"
        //
        // Result:
        //   api/admin/videos?ids=xx&v=1
        //   api/fisher/videos?ids=xx
        const separator = endpoint.includes("?") ? "&" : "?";
        const queryParams = new URLSearchParams({ ids: ids!.join(","), ...params });

        const response = await fetch(
          `${endpoint}${separator}${queryParams.toString()}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(`Failed to fetch ${type} files`);

        const data: T[] = await response.json();
        setFiles(data);
        setSelected(data[0] ?? null);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error(`Error fetching ${type} files:`, err);
        setError(`Unable to load ${type}s`);
        setFiles([]);
        setSelected(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchFiles();

    return () => controller.abort();
  }, [ids?.join(",")]);

  return { files, selected, setSelected, loading, error };
}
