import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Tooltip,
  Divider,
  Paper,
  FormHelperText,
} from "@mui/material";
import {
  Work as WorkIcon,
  Description as DescriptionIcon,
  Compare as CompareIcon,
} from "@mui/icons-material";
import { PrimaryButton, SecondaryButton } from "./common";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useLoading } from "../contexts/LoadingContext";
import { extractJobDetails } from "../services/JobService.js";

const JobOption = ({
  jobDescription,
  onJobDescriptionChange,
  onJobExtracted,
  onResumeCompare,
}) => {
  const { showSnackbar } = useSnackbar();
  const { startJobExtraction, stopLoading } = useLoading();
  const [isExtracting, setIsExtracting] = useState(false);

  // Validation helper function
  const validateJobDescription = (description) => {
    const trimmed = description?.trim() || "";
    return {
      isValid: trimmed.length >= 100,
      length: trimmed.length,
      isEmpty: trimmed.length === 0,
    };
  };

  const handleExtractJobDescription = async () => {
    const validation = validateJobDescription(jobDescription);

    if (validation.isEmpty) {
      showSnackbar(
        "Please enter a job description before submitting",
        "warning"
      );
      return;
    }

    if (!validation.isValid) {
      showSnackbar(
        `Job description is too short. Please enter at least 100 characters for better extraction results. Currently: ${validation.length} characters.`,
        "warning"
      );
      return;
    }

    try {
      setIsExtracting(true);
      startJobExtraction();
      sessionStorage.setItem("jobDescription", jobDescription);

      const extractedData = await extractJobDetails(jobDescription);
      onJobExtracted(extractedData);
      showSnackbar("Job description extracted and optimized!", "success");
    } catch (error) {
      showSnackbar(error.message, "error");
    } finally {
      setIsExtracting(false);
      stopLoading();
    }
  };

  const handleResumeCompare = () => {
    const validation = validateJobDescription(jobDescription);

    if (validation.isEmpty) {
      showSnackbar("Please enter job description first", "warning");
      return;
    }

    if (!validation.isValid) {
      showSnackbar(
        `Job description is too short for accurate comparison. Please enter at least 100 characters. Currently: ${validation.length} characters.`,
        "warning"
      );
      return;
    }

    onResumeCompare();
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "none",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 2, // Reduced spacing
      }}>
      {/* Header Section - More compact */}
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            mb: 1, // Reduced margin
          }}>
          <DescriptionIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography
            variant="h5" // Smaller heading
            sx={{ fontWeight: 700, color: "text.primary" }}>
            Job Description Analysis
          </Typography>
        </Box>
        <Typography
          variant="body2" // Smaller text
          color="text.secondary"
          sx={{ maxWidth: 500, mx: "auto", lineHeight: 1.4 }}>
          Paste your job description below to extract key details or compare
          with your resume
        </Typography>
      </Box>

      {/* Job Description Input - Paper layout */}
      <Paper
        elevation={1}
        sx={{
          p: 3, // Reduced padding
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <WorkIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            Job Description
          </Typography>
        </Box>

        <TextField
          label="Paste job description here..."
          value={jobDescription}
          onChange={(e) => {
            const value = e.target.value;
            onJobDescriptionChange(value);
          }}
          fullWidth
          multiline
          rows={6} // Reduced rows for more compact layout
          placeholder="Paste the complete job description here to enable the options below..."
          variant="outlined"
          error={(() => {
            const validation = validateJobDescription(jobDescription);
            return !validation.isEmpty && !validation.isValid;
          })()}
          sx={{
            "& .MuiInputBase-root": {
              fontSize: "0.875rem",
              lineHeight: 1.4, // Tighter line height
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.875rem",
              fontWeight: 500,
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              maxHeight: "180px", // Reduced height
              overflow: "hidden",
            },
            "& .MuiInputBase-inputMultiline": {
              maxHeight: "150px", // Reduced inner height
              overflow: "auto !important",
              resize: "none",
            },
          }}
        />

        {/* Character count and validation feedback */}
        <Box
          sx={{
            mt: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <FormHelperText
            sx={{
              fontSize: "0.75rem",
              color: (() => {
                const validation = validateJobDescription(jobDescription);
                if (validation.isEmpty) return "text.secondary";
                if (!validation.isValid) return "error.main";
                return "warning.main";
              })(),
            }}>
            {(() => {
              const validation = validateJobDescription(jobDescription);
              if (validation.isEmpty) {
                return `Minimum 100 characters required`;
              }
              if (!validation.isValid) {
                return `${validation.length}/100 characters (too short)`;
              }

              return `${validation.length} characters (good, recommend 100+ for best results)`;
            })()}
          </FormHelperText>

          <Typography
            variant="caption"
            sx={{
              fontSize: "0.7rem",
              color: "text.secondary",
              fontFamily: "monospace",
            }}>
            {jobDescription?.length || 0} chars
          </Typography>
        </Box>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* Action Buttons - More compact */}
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2, // Reduced margin
            fontWeight: 600,
            color: "text.primary",
            fontSize: "1rem",
          }}>
          What would you like to do?
        </Typography>

        <Grid
          container
          justifyContent="center"
          sx={{ maxWidth: 500, mx: "auto" }}>
          <Grid item xs={12} sm={6}>
            <Tooltip
              title="AI will analyze the job description and extract key information like company, role, requirements, and skills."
              placement="top"
              arrow>
              <PrimaryButton
                startIcon={<WorkIcon />}
                onClick={handleExtractJobDescription}
                disabled={(() => {
                  const validation = validateJobDescription(jobDescription);
                  return (
                    validation.isEmpty || !validation.isValid || isExtracting
                  );
                })()}
                size="large"
                fullWidth
                loading={isExtracting}
                loadingText="Extracting...">
                Extract Job Details
              </PrimaryButton>
            </Tooltip>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Tooltip
              title="Upload your resume to compare it with the job description and get optimization suggestions."
              placement="top"
              arrow>
              <SecondaryButton
                startIcon={<CompareIcon />}
                onClick={handleResumeCompare}
                disabled={(() => {
                  const validation = validateJobDescription(jobDescription);
                  return (
                    validation.isEmpty || !validation.isValid || isExtracting
                  );
                })()}
                size="large"
                fullWidth>
                Compare Resume
              </SecondaryButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default JobOption;
