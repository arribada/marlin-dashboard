"use client";

import { requestBuilders } from "@/_lib/export/exportRequestBuilders";
import { ExportStatus, SubmitFilters } from "@/_types/export";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseExportJobReturn {
  exportStatus: ExportStatus | null;
  fileSizeBytes: number | null;
  failureCount: number;
  errorMessage: string | null;
  downloadLinkRef: RefObject<HTMLAnchorElement | null>;
  handleSubmit: (filters: SubmitFilters) => Promise<void>;
  handleRetry: (filters: SubmitFilters) => void;
  handleNewExport: () => void;
}

export function useExportJob(role: 'admin' | 'fisher' | 'analyst'): UseExportJobReturn {
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failureCount, setFailureCount] = useState<number>(0);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const attemptRef = useRef(0);
  const MAX_ATTEMPTS = 20;
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Clicks hidden <a> to trigger zip download from the browser automatically
  const triggerDownload = useCallback((jobId: string) => {
    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = `/api/${role}/export/download/${jobId}`;
      downloadLinkRef.current.click();
    }
  }, []);

  // Starts polling the server for job status every 3 seconds
  const startPolling = useCallback((jobId: string) => {
    const poll = async () => {
      if (attemptRef.current >= MAX_ATTEMPTS) {
        stopPolling();
        setExportStatus("failed");
        setErrorMessage("Export timed out. Please try again.");
        toast.error("Export timed out. Please try again.");
        return;
      }

      attemptRef.current += 1;
      const delay = Math.min(3000 * attemptRef.current, 30_000);

      try {
        const res = await fetch(`/api/${role}/export/status/${jobId}`);
        const data = await res.json();

        setExportStatus(data.status);

        if (data.status === "complete") {
          stopPolling();
          setFileSizeBytes(data.fileSizeBytes);
          setFailureCount(data.failureCount ?? 0);
          toast.success("Export ready, downloading file now");
          triggerDownload(jobId);
          return;
        }

        if (data.status === "failed") {
          stopPolling();
          setErrorMessage(data.errorMessage ?? "Export failed, please try again");
          toast.error(data.errorMessage ?? "Export failed, please try again");
          return;
        }
      } catch (err) {
        console.error("[useExportJob] Polling error:", err);
      }

      pollingRef.current = setTimeout(poll, delay);
    };

    pollingRef.current = setTimeout(poll, 3000);
  }, [stopPolling, triggerDownload]);

  const handleSubmit = useCallback(async (filters: SubmitFilters) => {
    try {
      const buildRequestBody = requestBuilders[role];
      const res = await fetch(`/api/${role}/export/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequestBody(filters)),
      });

      if (!res.ok) {
        toast.error("Failed to start export, please try again");
        return;
      }

      const { jobId } = await res.json();
      setExportStatus("pending");
      attemptRef.current = 0;
      startPolling(jobId);
    } catch (err) {
      console.error("[useExportJob] Submit error:", err);
      toast.error("Something went wrong, please try again");
    }
  }, [startPolling]);

  const handleRetry = useCallback((filters: SubmitFilters) => {
    attemptRef.current = 0;
    stopPolling();
    setExportStatus(null);
    setFileSizeBytes(null);
    setErrorMessage(null);
    setFailureCount(0);
    handleSubmit(filters);
  }, [stopPolling, handleSubmit]);

  const handleNewExport = useCallback(() => {
    attemptRef.current = 0;
    stopPolling();
    setExportStatus(null);
    setFileSizeBytes(null);
    setFailureCount(0);
  }, [stopPolling]);

  return {
    exportStatus,
    fileSizeBytes,
    failureCount,
    errorMessage,
    downloadLinkRef,
    handleSubmit,
    handleRetry,
    handleNewExport,
  };
}
