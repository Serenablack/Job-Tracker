import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Stack,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  TableChart as GoogleSheetsIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { PrimaryButton } from "./common";
import { useSnackbar } from "../contexts/SnackbarContext";
import { getGoogleToken } from "../utils/authUtils.js";
import { API_BASE_URL } from "../services/googleSheetService.js";

const JobForm = ({ extractedJobData, onBack }) => {
  const { showSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    company: "",
    title: "",
    salary: "",
    location: "",
    type: "",
    experience: "",
    workModel: "",
    education: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (extractedJobData) {
      setFormData({ ...formData, ...extractedJobData });
    }
  }, [extractedJobData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCopyData = async () => {
    try {
      // Format data for manual paste in Google Sheets (tab-separated values)
      const tsvData = [
        formData.company || "",
        formData.title || "",
        formData.salary || "",
        formData.location || "",
        formData.type || "",
        formData.experience || "",
        formData.workModel || "",
        formData.education || "",
        new Date().toLocaleString(),
      ].join("\t");

      await navigator.clipboard.writeText(tsvData);
      showSnackbar(
        "Job data copied! You can now paste it directly into a new row in Google Sheets.",
        "success"
      );
    } catch {
      showSnackbar("Failed to copy data to clipboard", "error");
    }
  };

  const handleClearData = () => {
    setFormData({
      company: "",
      title: "",
      salary: "",
      location: "",
      type: "",
      experience: "",
      workModel: "",
      education: "",
    });
    // Clear job description from session storage
    sessionStorage.removeItem("jobDescription");
    showSnackbar("Form data cleared", "info");
  };

  const handleBack = () => {
    // Clear job description from session storage
    sessionStorage.removeItem("jobDescription");
    onBack();
  };

  const handleCopyToGoogleSheets = async () => {
    // Validate required fields
    if (!formData.company?.trim() || !formData.title?.trim()) {
      showSnackbar("Company and Job Title are required fields", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if sheet ID exists
      const sheetId = localStorage.getItem("googleSheetId");
      if (!sheetId) {
        showSnackbar(
          "No Google Sheet found. Please refresh the page to setup Google Sheets integration.",
          "error"
        );
        return;
      }

      // Get Google OAuth token from Chrome Storage
      const token = await getGoogleToken();
      if (!token) {
        showSnackbar(
          "No Google OAuth token found. Please login again.",
          "error"
        );
        return;
      }

      // Prepare data for Google Sheets (matching backend structure)
      const jobData = {
        company: formData.company.trim(),
        title: formData.title.trim(),
        salary: formData.salary || "",
        location: formData.location || "",
        type: formData.type || "",
        experience: formData.experience || "",
        workModel: formData.workModel || "",
        education: formData.education || "",
      };

      // Use existing endpoint
      const response = await fetch(
        `${API_BASE_URL}/jobs/add-to-excel/${sheetId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jobData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to add job to Google Sheets"
        );
      }

      showSnackbar(
        "Job details successfully added to Google Sheets!",
        "success"
      );
    } catch (error) {
      console.error("Error adding job to Google Sheets:", error);
      showSnackbar(
        error.message || "Failed to add job to Google Sheets",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTextField = (
    field,
    label,
    placeholder = "",
    required = false
  ) => (
    <TextField
      fullWidth
      label={label}
      value={formData[field] || ""}
      onChange={(e) => handleFieldChange(field, e.target.value)}
      placeholder={placeholder}
      variant="outlined"
      size="small"
      required={required}
      error={required && !formData[field]?.trim()}
      helperText={
        required && !formData[field]?.trim() ? `${label} is required` : ""
      }
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 1.5,
          fontSize: "0.875rem",
        },
        "& .MuiInputLabel-root": {
          fontSize: "0.875rem",
          color: "text.secondary",
        },
        "& .MuiFormHelperText-root": {
          fontSize: "0.75rem",
        },
      }}
    />
  );

  return (
    <Box
      sx={{
        width: "100%",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
      {/* Simple Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}>
        {/* Left: Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Copy job data" arrow>
            <IconButton
              onClick={handleCopyData}
              size="small"
              sx={{
                p: 0.75,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                },
              }}>
              <CopyIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear form data" arrow>
            <IconButton
              onClick={handleClearData}
              size="small"
              sx={{
                p: 0.75,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  bgcolor: "error.light",
                  color: "error.contrastText",
                },
              }}>
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Center: Simple Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
          <WorkIcon sx={{ fontSize: 20, color: "primary.main" }} />
          Job Information
        </Typography>

        {/* Right: Back Button */}
        <Tooltip title="Go back" arrow>
          <IconButton
            onClick={handleBack}
            size="small"
            sx={{
              p: 0.75,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Form */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}>
        <Typography
          variant="subtitle1"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
          <WorkIcon sx={{ fontSize: 18, color: "primary.main" }} />
          Job Details
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderTextField("company", "Company", "e.g., Google Inc.", true)}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField(
              "title",
              "Job Title",
              "e.g., Software Engineer",
              true
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField("salary", "Salary", "e.g., $70,000-$90,000")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField("location", "Location", "e.g., New York, NY")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField("type", "Employment Type", "e.g., Full-time")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField("workModel", "Work Model", "e.g., Remote, Hybrid")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField(
              "experience",
              "Experience Required",
              "e.g., 3-5 years"
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField(
              "education",
              "Education",
              "e.g., Bachelor's degree"
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Simple Action Section */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          textAlign: "center",
          bgcolor: "background.paper",
        }}>
        <Typography
          variant="subtitle1"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: "text.primary",
          }}>
          Save to Google Sheets
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: "text.secondary",
            maxWidth: 400,
            mx: "auto",
          }}>
          Add this job to your tracking spreadsheet
        </Typography>

        <PrimaryButton
          onClick={handleCopyToGoogleSheets}
          startIcon={<GoogleSheetsIcon />}
          disabled={
            isSubmitting || !formData.company?.trim() || !formData.title?.trim()
          }
          size="medium"
          sx={{
            px: 3,
            py: 1,
            fontSize: "0.875rem",
            fontWeight: 500,
            borderRadius: 2,
            "&:disabled": {
              opacity: 0.6,
            },
          }}>
          {isSubmitting ? "Adding..." : "Add to Google Sheets"}
        </PrimaryButton>

        {(!formData.company?.trim() || !formData.title?.trim()) && (
          <Typography
            variant="caption"
            display="block"
            sx={{
              mt: 1,
              color: "text.secondary",
              fontWeight: 500,
            }}>
            ⚠️ Company and Job Title are required
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default JobForm;
