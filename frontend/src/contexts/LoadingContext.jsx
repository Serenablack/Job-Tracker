import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingVariant, setLoadingVariant] = useState("default");
  const [loadingProgress, setLoadingProgress] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  const startLoading = (message = "Loading...", variant = "default") => {
    setLoadingMessage(message);
    setLoadingVariant(variant);
    setLoading(true);
    setLoadingProgress(null);
    setShowProgress(false);
  };

  const startProgressLoading = (
    message = "Loading...",
    variant = "default"
  ) => {
    setLoadingMessage(message);
    setLoadingVariant(variant);
    setLoading(true);
    setLoadingProgress(0);
    setShowProgress(true);
  };

  const updateProgress = (progress) => {
    setLoadingProgress(progress);
  };

  const stopLoading = () => {
    setLoading(false);
    setLoadingMessage("");
    setLoadingVariant("default");
    setLoadingProgress(null);
    setShowProgress(false);
  };

  // Job-specific loading helpers
  const startJobExtraction = () => {
    startLoading("Extracting job details...", "job-extract");
  };

  const startResumeAnalysis = () => {
    startLoading("Analyzing resume...", "resume-analyze");
  };

  const startResumeGeneration = () => {
    startLoading("Generating optimized resume...", "resume-generate");
  };

  const startFileUpload = () => {
    startLoading("Uploading file...", "upload");
  };

  const startFileDownload = () => {
    startLoading("Downloading file...", "download");
  };

  const startSetupLoading = () => {
    startLoading("Setting up Google Sheets integration...", "page");
  };

  return (
    <LoadingContext.Provider
      value={{
        loading,
        loadingMessage,
        loadingVariant,
        loadingProgress,
        showProgress,
        startLoading,
        startProgressLoading,
        updateProgress,
        stopLoading,
        // Job-specific helpers
        startJobExtraction,
        startResumeAnalysis,
        startResumeGeneration,
        startFileUpload,
        startFileDownload,
        startSetupLoading,
      }}>
      {children}
    </LoadingContext.Provider>
  );
};
