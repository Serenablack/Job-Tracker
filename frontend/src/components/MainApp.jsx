import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { useSnackbar } from "../contexts/SnackbarContext";
import { Header } from "./common";
import AuthPage from "./AuthPage";
import JobOption from "./JobOption";
import JobForm from "./JobForm";
import ResumeCompare from "./ResumeCompare";
import Loading from "./Loading";
import { getGoogleToken } from "../utils/authUtils.js";
import { API_CONFIG } from "../constants/constants.js";
import { apiRequest } from "../utils/apiUtils.js";

const API_BASE_URL = API_CONFIG.BASE_URL;

const MainApp = () => {
  const { isAuthenticated } = useAuth();
  const {
    loading,
    loadingMessage,
    loadingVariant,
    loadingProgress,
    showProgress,
    startSetupLoading,
    stopLoading,
  } = useLoading();
  const { showSnackbar } = useSnackbar();
  const [currentView, setCurrentView] = useState("jobOption");
  const [jobDescription, setJobDescription] = useState("");
  const [extractedJobData, setExtractedJobData] = useState(null);

  useEffect(() => {
    const savedJobDescription = sessionStorage.getItem("jobDescription");
    if (savedJobDescription) {
      setJobDescription(savedJobDescription);
    }
  }, []);

  const setupInitialSheet = useCallback(async () => {
    try {
      startSetupLoading();

      const token = await getGoogleToken();

      if (!token) {
        throw new Error("No Google OAuth token found. Please login again.");
      }

      const response = await apiRequest(
        `${API_BASE_URL}/jobs/upload-file`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "Failed to setup Google Sheets integration",
        "fileId"
      );

      // Store sheet ID
      localStorage.setItem("googleSheetId", response.data);

      showSnackbar("Google Sheets integration setup successfully!", "success");
    } catch (error) {
      console.error("Error setting up initial sheet:", error);
      showSnackbar(
        `Failed to setup Google Sheets integration: ${error.message}`,
        "error"
      );
    } finally {
      stopLoading();
    }
  }, [startSetupLoading, showSnackbar, stopLoading]);

  const checkAndSetupGoogleSheet = useCallback(async () => {
    try {
      const sheetId = localStorage.getItem("googleSheetId");

      if (!sheetId) {
        // No sheet exists, setup initial sheet
        await setupInitialSheet();
      }
      // If sheet exists, assume it's valid (will be verified on use)
    } catch (error) {
      console.error("Error checking Google Sheet:", error);
      showSnackbar("Failed to setup Google Sheets integration", "error");
    }
  }, [showSnackbar, setupInitialSheet]);

  useEffect(() => {
    if (isAuthenticated) {
      checkAndSetupGoogleSheet();
    }
  }, [isAuthenticated, checkAndSetupGoogleSheet]);

  const handleJobDescriptionChange = (value) => {
    setJobDescription(value);
    sessionStorage.setItem("jobDescription", value);
  };

  const handleJobExtracted = (data) => {
    setExtractedJobData(data);
    setCurrentView("jobForm");
  };

  const handleResumeCompare = () => {
    setCurrentView("resumeCompare");
  };

  const handleBackToJobOptions = () => {
    setCurrentView("jobOption");
    setExtractedJobData(null);
  };

  const handleBackToJobForm = () => {
    setCurrentView("jobForm");
  };

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "fit-content", // Fit content for extension
        minHeight: "400px", // Ensure minimum usable height
        maxHeight: "600px", // Prevent excessive popup size
        overflow: "hidden",
      }}>
      <Header />

      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: "auto",
          bgcolor: "background.default",
          width: "100%",
          minHeight: 0, // Important for flex child
          position: "relative",
        }}>
        {/* Enhanced Loading with variants and progress */}
        {loading && (
          <Loading
            variant={loadingVariant}
            message={loadingMessage}
            progress={loadingProgress}
            showProgress={showProgress}
            backdrop={true}
          />
        )}

        <Box
          sx={{
            py: 0.75,
            px: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
            width: "100%",
            maxWidth: "100%",
          }}>
          {currentView === "jobOption" && (
            <JobOption
              jobDescription={jobDescription}
              onJobDescriptionChange={handleJobDescriptionChange}
              onJobExtracted={handleJobExtracted}
              onResumeCompare={handleResumeCompare}
            />
          )}

          {currentView === "jobForm" && extractedJobData && (
            <JobForm
              extractedJobData={extractedJobData}
              onBack={handleBackToJobOptions}
            />
          )}

          {currentView === "resumeCompare" && (
            <ResumeCompare
              jobDescription={jobDescription}
              jobData={extractedJobData}
              onBack={
                extractedJobData ? handleBackToJobForm : handleBackToJobOptions
              }
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MainApp;
