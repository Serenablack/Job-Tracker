import React, { useState, useEffect } from "react";
import { Box, Container } from "@mui/material";
import { useLoading } from "../contexts/LoadingContext";
import JobOption from "../pages/jobs/JobOption";
import JobForm from "./JobForm";
import ResumeCompare from "./ResumeCompare";
import Loading from "./Loading";

const MainContent = () => {
  const { loading } = useLoading();
  const [currentView, setCurrentView] = useState("jobOption");
  const [jobDescription, setJobDescription] = useState("");
  const [extractedJobData, setExtractedJobData] = useState(null);

  // Load saved job description on mount
  useEffect(() => {
    const savedJobDescription = sessionStorage.getItem("jobDescription");
    if (savedJobDescription) {
      setJobDescription(savedJobDescription);
    }
  }, []);

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

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        overflow: "auto",
        bgcolor: "background.default",
        position: "relative",
      }}>
      {loading && <Loading variant="page" />}

      <Container
        maxWidth="lg"
        sx={{
          py: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
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
            onResumeCompare={handleResumeCompare}
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
      </Container>
    </Box>
  );
};

export default MainContent;
