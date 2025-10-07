import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  IconButton,
  Paper,
} from "@mui/material";

import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  UploadFile as UploadFileIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import ResumeGeneratePage from "./resume/ResumeGeneratePage";
import ResumeAnalysisPage from "./resume/ResumeAnalysisPage";
import ResumeUploadPage from "./resume/ResumeUploadPage";
import ResumeDownloadPage from "./resume/ResumeDownloadPage";
import { useSnackbar } from "../contexts/SnackbarContext.jsx";
import { useLoading } from "../contexts/LoadingContext.jsx";
import {
  downloadResume,
  generateResume,
  saveResumeToGoogleDrive,
  cleanupTemporaryResume,
} from "../services/JobService.js";
import { createFormDataHeaders } from "../utils/authUtils.js";
import Loading from "./Loading.jsx";
import { PrimaryButton, SecondaryButton } from "./common";
import { useAuth } from "../contexts/AuthContext.jsx";
import { API_CONFIG } from "../constants/constants.js";

const API_BASE_URL = API_CONFIG.BASE_URL;

const ResumeCompare = ({ jobDescription, jobData, onBack }) => {
  const { showSnackbar } = useSnackbar();
  const {
    loading,
    loadingVariant,
    startResumeAnalysis,
    startResumeGeneration,
    startFileDownload,
    stopLoading,
  } = useLoading();
  const { googleToken } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [showDriveDialog, setShowDriveDialog] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState("");

  const steps = [
    { label: "Upload & Analyze", icon: UploadFileIcon },
    { label: "Review & Generate", icon: AssessmentIcon },
    { label: "Download & Save", icon: DownloadIcon },
  ];

  const generateFileName = useCallback(
    (extension, jobDataOverride = null) => {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const currentJobData = jobDataOverride || jobData;
      const companyName =
        currentJobData?.company ||
        currentJobData?.companyName ||
        currentJobData?.employer ||
        "Company";
      const cleanCompanyName = companyName
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 20);
      return `${cleanCompanyName}_Resume_${dateStr}.${extension}`;
    },
    [jobData]
  );

  const handleFileSelect = useCallback(
    (file) => {
      setSelectedFile(file);
      setComparisonResult(null);
      setResumeText(null);
      setCurrentPage(0);
    },
    [setSelectedFile, setCurrentPage, setComparisonResult, setResumeText]
  );

  const handleSendForComparison = useCallback(async () => {
    if (!selectedFile) return;

    // Guard: require job description
    if (!jobDescription || !jobDescription.trim()) {
      showSnackbar("Job description is required", "warning");
      return;
    }

    // Guard: require auth token
    if (!googleToken) {
      showSnackbar("Please login to analyze your resume.", "warning");
      return;
    }

    startResumeAnalysis();
    showSnackbar("Uploading and analyzing resume...", "info");
    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("jobDescription", jobDescription);
      const headers = await createFormDataHeaders();
      const res = await fetch(`${API_BASE_URL}/resume/upload-resume`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "Upload/analysis failed";
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const errorData = await res.json();
            errorMessage =
              errorData.error?.message ||
              errorData.error ||
              errorData.message ||
              errorMessage;
          } else {
            const text = await res.text();
            errorMessage = text?.slice(0, 500) || errorMessage;
          }
        } catch {
          // noop - could not parse error response
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (!data || !data.data?.analysisResult) {
        throw new Error("Invalid response from server");
      }

      setComparisonResult(data.data.analysisResult);
      setResumeText(data.data.resumeText);
      showSnackbar("Resume uploaded and analyzed successfully!", "success");
      setCurrentPage(1);
    } catch (error) {
      console.error("Upload/analysis error:", error);
      const message = (error?.message || "Upload/analysis failed").slice(
        0,
        300
      );
      showSnackbar(`Upload/analysis failed: ${message}`, "error");
      // Keep selectedFile so user can retry
      setResumeText(null);
    } finally {
      stopLoading();
    }
  }, [
    selectedFile,
    jobDescription,
    googleToken,
    showSnackbar,
    setComparisonResult,
    setResumeText,
    setCurrentPage,
    startResumeAnalysis,
    stopLoading,
  ]);

  const handleGenerateResume = useCallback(async () => {
    if (!selectedFile) {
      showSnackbar("Please upload your resume first.", "warning");
      return;
    }
    if (!jobDescription.trim()) {
      showSnackbar(
        "Job description is required to generate resume.",
        "warning"
      );
      return;
    }
    if (!comparisonResult) {
      showSnackbar("Please analyze your resume first.", "warning");
      return;
    }
    if (!resumeText) {
      showSnackbar(
        "Resume text not available. Please re-upload your resume.",
        "error"
      );
      return;
    }

    startResumeGeneration();
    showSnackbar("Generating ATS-optimized resume...", "info");

    try {
      const result = await generateResume(
        resumeText,
        jobDescription,
        comparisonResult,
        selectedFile.name
      );

      // Handle different possible response structures
      const optimizedResumeText = result?.optimizedResume?.optimizedResume;

      if (
        !optimizedResumeText ||
        typeof optimizedResumeText !== "string" ||
        optimizedResumeText.trim() === ""
      ) {
        console.error("No valid optimized resume text in result:", result);
        throw new Error("No valid optimized resume text received from server");
      }

      if (result?.improvements) {
        const improvements = result?.improvements;
        setComparisonResult((prev) => ({
          ...prev,
          improvements: improvements,
          recommendations: improvements,
        }));
      }

      setResumeText(optimizedResumeText);
      setCurrentPage(2);
      showSnackbar("ATS-optimized resume generated successfully!", "success");
    } catch (error) {
      console.error("Resume generation error:", error);
      showSnackbar(error.message || "Failed to generate resume.", "error");
    } finally {
      stopLoading();
    }
  }, [
    selectedFile,
    jobDescription,
    comparisonResult,
    resumeText,
    showSnackbar,
    setResumeText,
    setCurrentPage,
    startResumeGeneration,
    stopLoading,
  ]);

  const handleCleanupOnly = useCallback(async () => {
    try {
      if (selectedFile?.name) {
        await cleanupTemporaryResume(null, selectedFile.name);
        showSnackbar("Temporary files cleaned up.", "info");
      }
    } catch (error) {
      console.warn("Failed to cleanup temporary resume:", error);
    }
  }, [selectedFile, showSnackbar]);

  const handleDownloadDocx = useCallback(
    async (jobData = null) => {
      if (!resumeText) {
        showSnackbar("Please generate resume first.", "warning");
        return;
      }
      startFileDownload();
      showSnackbar("Preparing DOCX download...", "info");
      try {
        const blob = await downloadResume(resumeText, "docx");
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const fileName = generateFileName("docx", jobData);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setCurrentPage(2);
        setDownloadedFileName(fileName);
        showSnackbar("Resume DOCX downloaded successfully!", "success");

        if (googleToken) {
          setShowDriveDialog(true);
        } else {
          await handleCleanupOnly();
        }
      } catch (error) {
        showSnackbar(
          error.message || "Failed to download DOCX resume.",
          "error"
        );
      } finally {
        stopLoading();
      }
    },
    [
      resumeText,
      showSnackbar,
      generateFileName,
      googleToken,
      handleCleanupOnly,
      startFileDownload,
      stopLoading,
    ]
  );

  const handleDownloadPdf = useCallback(
    async (jobData = null) => {
      if (!resumeText) {
        showSnackbar("Please generate resume first.", "warning");
        return;
      }
      startFileDownload();
      showSnackbar("Preparing PDF download...", "info");
      try {
        const blob = await downloadResume(resumeText, "pdf");
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const fileName = generateFileName("pdf", jobData);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setCurrentPage(2);
        setDownloadedFileName(fileName);
        showSnackbar(
          "Professional resume PDF downloaded successfully!",
          "success"
        );

        await handleCleanupOnly();
      } catch (error) {
        showSnackbar(
          error.message || "Failed to download PDF resume.",
          "error"
        );
      } finally {
        stopLoading();
      }
    },
    [
      resumeText,
      showSnackbar,
      generateFileName,
      handleCleanupOnly,
      startFileDownload,
      stopLoading,
    ]
  );

  const handleReset = useCallback(() => {
    setCurrentPage(0);
    setSelectedFile(null);
    setResumeText(null);
    setComparisonResult(null);
    stopLoading();
    setDownloadedFileName("");
    showSnackbar("Process reset.", "info");
  }, [
    showSnackbar,
    setCurrentPage,
    setSelectedFile,
    setResumeText,
    setComparisonResult,
    stopLoading,
    setDownloadedFileName,
  ]);

  const handleSaveToGoogleDrive = useCallback(async () => {
    setShowDriveDialog(false);
    if (!resumeText || !downloadedFileName || !googleToken) {
      showSnackbar(
        "Missing required information for Google Drive save.",
        "error"
      );
      return;
    }

    try {
      showSnackbar("Saving resume to Google Drive...", "info");
      const result = await saveResumeToGoogleDrive(
        resumeText,
        downloadedFileName,
        googleToken
      );
      showSnackbar(
        result.message || "Resume saved to Google Drive successfully!",
        "success"
      );
    } catch (error) {
      showSnackbar(
        error.message || "Failed to save resume to Google Drive.",
        "error"
      );
    }

    await handleCleanupOnly();
  }, [
    resumeText,
    downloadedFileName,
    googleToken,
    showSnackbar,
    handleCleanupOnly,
  ]);

  const handleDeclineGoogleDrive = useCallback(async () => {
    setShowDriveDialog(false);
    await handleCleanupOnly();
  }, [handleCleanupOnly]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        minHeight: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
      }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          p: 2,
          flexShrink: 0,
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Go back to job options">
            <IconButton onClick={onBack} color="primary">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Resume Analysis & Optimization
          </Typography>
        </Box>
        <Tooltip title="Reset Process">
          <IconButton onClick={handleReset} color="secondary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stepper Card */}
      <Paper elevation={1} sx={{ mb: 3, p: 2, mx: 2, flexShrink: 0 }}>
        <Stepper
          activeStep={currentPage}
          orientation="horizontal"
          sx={{ display: "flex", justifyContent: "space-between" }}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Step key={step.label} completed={index < currentPage}>
                <StepLabel
                  icon={React.createElement(Icon, { fontSize: "small" })}
                  sx={{
                    "& .MuiStepLabel-label": {
                      mt: 0.5,
                      fontSize: "0.75rem",
                      fontWeight: currentPage === index ? 700 : 600,
                      color: currentPage === index ? "primary.main" : "inherit",
                    },
                    "& .MuiStepLabel-iconContainer": {
                      p: 0,
                      "& .MuiSvgIcon-root": {
                        fontSize: "1.2rem",
                        color:
                          currentPage === index ? "primary.main" : "inherit",
                      },
                    },
                  }}>
                  {step.label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      {/* Main Content Area with Loading Overlay */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          minHeight: 0,
          overflow: loading ? "hidden" : "auto",
        }}>
        {/* Loading Overlay */}
        {loading && (
          <Loading
            variant={loadingVariant}
            message={
              loadingVariant === "resume-analyze"
                ? "Analyzing your resume..."
                : "Generating optimized resume..."
            }
            subMessage={
              loadingVariant === "resume-analyze"
                ? "Please wait while we analyze your resume against the job description"
                : "Creating your ATS-optimized resume"
            }
            backdrop={true}
          />
        )}

        {/* Step Content */}
        <Box
          sx={{
            height: "100%",
            overflow: loading ? "hidden" : "auto",
            p: 3,
            pb: 4,
            opacity: loading ? 0.3 : 1,
            transition: "opacity 0.3s ease",
            pointerEvents: loading ? "none" : "auto",
            display: "flex",
            flexDirection: "column",
          }}>
          {currentPage === 0 && (
            <ResumeUploadPage
              selectedFile={selectedFile}
              isAnalyzing={loading && loadingVariant === "resume-analyze"}
              jobDescription={jobDescription}
              onFileSelect={handleFileSelect}
              onAnalyze={handleSendForComparison}
            />
          )}
          {currentPage === 1 && (
            <ResumeAnalysisPage
              comparisonResult={comparisonResult}
              onGenerateTrigger={handleGenerateResume}
            />
          )}
          {currentPage === 2 && (
            <ResumeDownloadPage
              comparisonResult={comparisonResult}
              resumeText={resumeText}
              handleDownloadDocx={handleDownloadDocx}
              handleDownloadPdf={handleDownloadPdf}
              handleReset={handleReset}
              jobData={jobData}
            />
          )}
        </Box>
      </Box>

      {/* Google Drive Dialog */}
      <Dialog
        open={showDriveDialog}
        onClose={handleDeclineGoogleDrive}
        aria-labelledby="drive-dialog-title"
        aria-describedby="drive-dialog-description"
        maxWidth="sm"
        fullWidth>
        <DialogTitle id="drive-dialog-title">
          Save Resume to Google Drive?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="drive-dialog-description">
            Your resume has been downloaded successfully! Would you like to also
            save a copy to your Google Drive in the "resume" folder?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={handleDeclineGoogleDrive} size="medium">
            No, Thanks
          </SecondaryButton>
          <PrimaryButton onClick={handleSaveToGoogleDrive} autoFocus>
            Yes, Save to Drive
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeCompare;
