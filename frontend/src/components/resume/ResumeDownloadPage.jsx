import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
} from "@mui/icons-material";
import { PrimaryButton, SecondaryButton } from "../common";

const ResumeDownloadPage = ({
  comparisonResult,
  resumeText,
  handleDownloadDocx,
  handleDownloadPdf,
  jobData,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  // Safely extract improvements with comprehensive fallbacks
  const improvements = React.useMemo(() => {
    if (!comparisonResult || typeof comparisonResult !== "object") {
      return [
        "Enhanced with missing keywords",
        "Improved ATS compatibility",
        "Optimized formatting",
        "Added relevant skills",
      ];
    }

    const extractedImprovements =
      comparisonResult.improvements ||
      comparisonResult.suggestions ||
      comparisonResult.recommendations ||
      [];

    // Ensure we have an array
    if (
      Array.isArray(extractedImprovements) &&
      extractedImprovements.length > 0
    ) {
      return extractedImprovements;
    }

    // Fallback improvements based on available data
    const fallbackImprovements = [];

    if (comparisonResult.missingSkills?.length > 0) {
      fallbackImprovements.push(
        `Added ${comparisonResult.missingSkills.length} missing skills`
      );
    }

    if (comparisonResult.atsScore || comparisonResult.overallScore) {
      fallbackImprovements.push("Improved ATS compatibility score");
    }

    if (comparisonResult.keywordMatch !== undefined) {
      fallbackImprovements.push("Enhanced keyword optimization");
    }

    // Add generic improvements if no specific ones found
    if (fallbackImprovements.length === 0) {
      fallbackImprovements.push(
        "Enhanced with missing keywords",
        "Improved ATS compatibility",
        "Optimized formatting",
        "Added relevant skills"
      );
    }

    return fallbackImprovements;
  }, [comparisonResult]);

  const handleDownload = async (format) => {
    if (!resumeText || resumeText.trim() === "") {
      console.error("No resume text available for download");
      return;
    }

    try {
      if (format === "pdf" && typeof handleDownloadPdf === "function") {
        await handleDownloadPdf("clean", jobData);
      } else if (
        format === "docx" &&
        typeof handleDownloadDocx === "function"
      ) {
        await handleDownloadDocx("clean", jobData);
      } else {
        console.error(
          `Invalid download format: ${format} or handler not available`
        );
      }
    } catch (error) {
      console.error("Download failed:", error);
      // Show user notification for download errors
      if (typeof window !== "undefined" && window.showSnackbar) {
        window.showSnackbar(`Download failed: ${error.message}`, "error");
      }
    }
  };

  // Early return if no resume text available
  if (!resumeText || resumeText.trim() === "") {
    return (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Resume Generation Required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please generate your resume first before downloading.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 1 }}>
        <CheckIcon sx={{ color: "success.main", mb: 0.25 }} />
        <Typography variant="h6" fontWeight={600}>
          Resume Ready for Download
        </Typography>
      </Box>

      {/* Improvements List */}
      {improvements && improvements.length > 0 && (
        <Box
          sx={{
            p: 1,
            border: "1px solid",
            borderColor: "success.main",
            borderRadius: 1,
            bgcolor: "success.50",
            mb: 1,
          }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
            Key Improvements ({improvements.length})
          </Typography>
          <List dense sx={{ py: 0 }}>
            {improvements.slice(0, 3).map((improvement, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary={improvement}
                  primaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Download Options */}
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <PrimaryButton
            fullWidth
            size="medium"
            startIcon={<PdfIcon />}
            onClick={() => handleDownload("pdf")}
            sx={{
              background: "linear-gradient(45deg, #f44336 30%, #ff9800 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #d32f2f 30%, #f57c00 90%)",
              },
            }}>
            Download PDF
          </PrimaryButton>
        </Box>
        <Box sx={{ flex: 1 }}>
          <PrimaryButton
            fullWidth
            size="medium"
            startIcon={<DocIcon />}
            onClick={() => handleDownload("docx")}
            sx={{
              background: "linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #1976d2 30%, #1e88e5 90%)",
              },
            }}>
            Download DOCX
          </PrimaryButton>
        </Box>
      </Box>

      {/* Preview Option */}
      <Box sx={{ textAlign: "center" }}>
        <SecondaryButton
          variant="text"
          size="small"
          onClick={() => setShowPreview(true)}>
          📄 Preview Resume
        </SecondaryButton>
      </Box>

      {/* Preview Dialog */}
      <Dialog
        maxWidth="md"
        fullWidth
        open={showPreview}
        onClose={() => setShowPreview(false)}>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Resume Preview
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: 400,
              overflow: "auto",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
            }}>
            {resumeText && resumeText.trim() !== "" ? (
              <Typography
                variant="body2"
                component="div"
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "'Roboto', sans-serif",
                  lineHeight: 1.6,
                  fontSize: "0.875rem",
                  textAlign: "left",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}>
                {resumeText}
              </Typography>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="error" gutterBottom>
                  No Resume Content Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unable to load resume content for preview. Please try
                  generating the resume again.
                </Typography>
                {/* Debug info in development */}
                {typeof window !== "undefined" &&
                  window.location.hostname === "localhost" && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1,
                        bgcolor: "grey.100",
                        borderRadius: 1,
                      }}>
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: "monospace" }}>
                        Debug: resumeText type: {typeof resumeText}, length:{" "}
                        {resumeText?.length || 0}
                      </Typography>
                    </Box>
                  )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <SecondaryButton size="small" onClick={() => setShowPreview(false)}>
            Close
          </SecondaryButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeDownloadPage;
