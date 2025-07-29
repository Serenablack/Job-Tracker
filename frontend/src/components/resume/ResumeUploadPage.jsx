// src/components/resume-compare/ResumeUploadPage.jsx
import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  LinearProgress,
  Fade,
  Zoom,
  Slide,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  InsertDriveFile as DriveFileIcon,
} from "@mui/icons-material";
import { PrimaryButton, SecondaryButton } from "../common";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
  "application/vnd.ms-word.document.12", // .doc
];

const ResumeUploadPage = ({
  selectedFile,
  isAnalyzing,
  onFileSelect,
  onAnalyze,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [uploadTime, setUploadTime] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = useCallback((file) => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Please upload PDF, DOCX, or DOC files only.",
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 5MB limit. Current size: ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`,
      };
    }

    return { valid: true, error: null };
  }, []);

  const handleFileSelect = useCallback(
    (file) => {
      setFileError(null);
      const validation = validateFile(file);

      if (!validation.valid) {
        setFileError(validation.error);
        return;
      }

      setUploadTime(new Date());
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(() => {
    setFileError(null);
    setUploadTime(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onFileSelect]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    return "📄";
  };

  const steps = [
    {
      label: "Upload Resume",
      description: "Drag & drop or click to upload your resume",
      completed: !!selectedFile,
    },
    {
      label: "Validation",
      description: "File type and size verification",
      completed: !!selectedFile && !fileError,
    },
    {
      label: "Ready for Analysis",
      description: "Resume ready to be analyzed",
      completed: !!selectedFile && !fileError,
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        p: 2,
        width: "100%",
        minHeight: "fit-content",
      }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "white",
              mb: 2,
              boxShadow: 3,
            }}>
            <UploadIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Upload Your Resume
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 500, mx: "auto" }}>
            Upload your resume in PDF, DOCX, or DOC format (max 5MB) to analyze
            it against the job description
          </Typography>
        </Box>
      </Fade>

      {/* Stepper */}
      <Fade in timeout={800}>
        <Paper elevation={2} sx={{ mb: 4, p: 3, borderRadius: 3 }}>
          <Stepper
            activeStep={selectedFile ? (fileError ? 1 : 2) : 0}
            orientation="horizontal">
            {steps.map((step) => (
              <Step key={step.label} completed={step.completed}>
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label": {
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    },
                  }}>
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Fade>

      {/* Upload Area */}
      <Fade in timeout={1000}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            overflow: "hidden",
            border: dragActive ? "2px solid" : "2px solid transparent",
            borderColor: dragActive ? "primary.main" : "transparent",
            transition: "all 0.3s ease",
            width: "100%",
            maxWidth: "100%",
          }}>
          <CardContent sx={{ p: 0 }}>
            {/* Upload Zone */}
            <Box
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                p: 6,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: dragActive ? "primary.50" : "background.default",
                transition: "all 0.3s ease",
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  bgcolor: "primary.50",
                },
              }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileInput}
                style={{ display: "none" }}
              />

              {selectedFile ? (
                <Zoom in>
                  <Box sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        bgcolor: "success.main",
                        color: "white",
                        mb: 2,
                      }}>
                      <CheckIcon sx={{ fontSize: 30 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                  </Box>
                </Zoom>
              ) : (
                <Box>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: "grey.100",
                      color: "text.secondary",
                      mb: 3,
                    }}>
                    <UploadIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Drop your resume here or click to browse
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}>
                    Supports PDF, DOCX, and DOC files up to 5MB
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}>
                    <Chip label="PDF" size="small" variant="outlined" />
                    <Chip label="DOCX" size="small" variant="outlined" />
                    <Chip label="DOC" size="small" variant="outlined" />
                    <Chip
                      label="Max 5MB"
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                </Box>
              )}
            </Box>

            {/* File Details */}
            {selectedFile && (
              <Slide direction="up" in>
                <Box sx={{ p: 3, bgcolor: "grey.50" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      File Details
                    </Typography>
                    <Tooltip title="Remove file">
                      <IconButton
                        onClick={handleRemoveFile}
                        color="error"
                        size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 2,
                    }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DriveFileIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          File Name
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedFile.name}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <StorageIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          File Size
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatFileSize(selectedFile.size)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ScheduleIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Upload Time
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {uploadTime?.toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FileIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          File Type
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {getFileTypeIcon(selectedFile.type)}{" "}
                          {selectedFile.type.split("/")[1].toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Slide>
            )}

            {/* Error Display */}
            {fileError && (
              <Slide direction="up" in>
                <Box sx={{ p: 3, bgcolor: "error.50" }}>
                  <Alert severity="error" icon={<ErrorIcon />}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {fileError}
                    </Typography>
                  </Alert>
                </Box>
              </Slide>
            )}

            {/* Success Message */}
            {selectedFile && !fileError && (
              <Slide direction="up" in>
                <Box sx={{ p: 3, bgcolor: "success.50" }}>
                  <Alert severity="success" icon={<CheckIcon />}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      File uploaded successfully! Ready for analysis.
                    </Typography>
                  </Alert>
                </Box>
              </Slide>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Action Buttons */}
      <Fade in timeout={1200}>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <PrimaryButton
            onClick={onAnalyze}
            disabled={!selectedFile || !!fileError || isAnalyzing}
            size="large"
            startIcon={<UploadIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              borderRadius: 2,
              boxShadow: 2,
            }}>
            {isAnalyzing ? "Analyzing..." : "Send for Analysis"}
          </PrimaryButton>
        </Box>
      </Fade>

      {/* Progress Bar for Analysis */}
      {isAnalyzing && (
        <Fade in timeout={300}>
          <Box sx={{ mt: 3 }}>
            <LinearProgress
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, textAlign: "center" }}>
              Analyzing your resume against the job description...
            </Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default ResumeUploadPage;
