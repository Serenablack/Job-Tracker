import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  Paper,
  LinearProgress,
  IconButton,
  CircularProgress,
  Stack,
  useTheme,
  Avatar,
  Button,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Description as FileIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PdfIcon,
  ArticleOutlined as DocIcon,
  FileUpload as FileUploadIcon,
  CloudDone as CloudDoneIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { PrimaryButton } from "../common";
// Local file constraints
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.ms-word.document.12",
];
const FILE_TYPE_MAPPING = {
  "application/pdf": {
    ext: "PDF",
    icon: FileIcon,
    color: undefined,
    bgColor: undefined,
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    ext: "DOCX",
    icon: DocIcon,
    color: undefined,
    bgColor: undefined,
  },
  "application/msword": {
    ext: "DOC",
    icon: DocIcon,
    color: undefined,
    bgColor: undefined,
  },
  "application/vnd.ms-word.document.12": {
    ext: "DOC",
    icon: DocIcon,
    color: undefined,
    bgColor: undefined,
  },
};

// Local UI values (moved from constants)
const UPLOAD_MAX_WIDTH = 600;
const UPLOAD_CONTAINER_HEIGHT = 300;
const PRIMARY_BUTTON_MIN_WIDTH = 200;

const ResumeUploadPage = ({
  selectedFile,
  isAnalyzing,
  onFileSelect,
  onAnalyze,
}) => {
  const theme = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const uploadIntervalRef = useRef(null);

  const validateFile = useCallback((file) => {
    // Check if file exists and has required properties
    if (!file) {
      return {
        valid: false,
        error: "No file provided.",
      };
    }

    // Check file type (handle undefined/null file.type)
    const fileType = file.type || "";
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return {
        valid: false,
        error: "Invalid file type. Please upload PDF, DOCX, or DOC files only.",
      };
    }

    // Check file size (handle undefined/null file.size)
    const fileSize = file.size || 0;
    if (fileSize > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: "File size exceeds the maximum limit of 5MB.",
      };
    }
    if (fileSize === 0) {
      return {
        valid: false,
        error: "Please select a file to upload.",
      };
    }
    return { valid: true, error: null };
  }, []);

  const simulateUpload = useCallback(() => {
    setIsUploading(true);
    setUploadProgress(0);

    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
    }

    uploadIntervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadIntervalRef.current);
          uploadIntervalRef.current = null;
          setIsUploading(false);
          return 100;
        }
        const next = Math.min(100, prev + Math.random() * 30);
        if (next >= 100) {
          clearInterval(uploadIntervalRef.current);
          uploadIntervalRef.current = null;
          setIsUploading(false);
          return 100;
        }
        return next;
      });
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
    };
  }, []);

  const handleFileSelect = useCallback(
    (file) => {
      setFileError(null);

      // Guard against undefined/null file
      if (!file) {
        setFileError("No file selected.");
        return;
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        setFileError(validation.error);
        return;
      }

      // Only proceed if onFileSelect is provided
      if (typeof onFileSelect === "function") {
        simulateUpload();
        onFileSelect(file);
      } else {
        console.warn("onFileSelect callback not provided");
        setFileError("File selection handler not available.");
      }
    },
    [validateFile, onFileSelect, simulateUpload]
  );

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      if (
        x < rect.left ||
        x >= rect.right ||
        y < rect.top ||
        y >= rect.bottom
      ) {
        setDragActive(false);
      }
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      // Guard against undefined/null dataTransfer or files
      if (
        e?.dataTransfer?.files &&
        e.dataTransfer.files.length > 0 &&
        e.dataTransfer.files[0]
      ) {
        handleFileSelect(e.dataTransfer.files[0]);
      } else {
        setFileError("No file was dropped or file is invalid.");
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e) => {
      // Guard against undefined/null target or files
      if (e?.target?.files && e.target.files.length > 0 && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      } else {
        setFileError("No file selected from input.");
      }
    },
    [handleFileSelect]
  );

  const handleBrowseFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDeleteFile = useCallback(() => {
    // Only call onFileSelect if it's a function
    if (typeof onFileSelect === "function") {
      onFileSelect(null);
    }

    setFileError(null);
    setUploadProgress(0);
    setIsUploading(false);

    // Safely clear file input
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch (error) {
        console.warn("Could not clear file input:", error);
      }
    }
  }, [onFileSelect]);

  const formatFileSize = (bytes) => {
    // Handle undefined, null, or invalid bytes
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
      return "0 Bytes";
    }

    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Guard against invalid index
    const sizeIndex = Math.min(i, sizes.length - 1);
    const size = sizes[sizeIndex] || "Bytes";

    try {
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + size;
    } catch {
      return "Unknown size";
    }
  };

  const getFileTypeInfo = (fileType) => {
    // Handle undefined/null fileType
    const safeFileType = fileType || "";

    return (
      FILE_TYPE_MAPPING[safeFileType] || {
        ext: "Unknown",
        icon: FileIcon,
        color: theme?.palette?.text?.secondary || "#666",
        bgColor: theme?.palette?.grey?.[100] || "#f5f5f5",
      }
    );
  };

  const hasValidFile = selectedFile && !fileError;
  const showUploadedState =
    hasValidFile && !isUploading && uploadProgress === 100;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: UPLOAD_MAX_WIDTH,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Upload Your Resume
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click to upload or drag & drop your file here
        </Typography>
      </Box>

      {/* Upload Card */}
      <Paper
        sx={{
          border: fileError
            ? `2px solid ${theme.palette.error.main}`
            : showUploadedState
            ? `2px solid ${theme.palette.success.main}`
            : dragActive
            ? `2px solid ${theme.palette.primary.main}`
            : `2px dashed ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden",
          transition: "all 0.3s ease",
          width: "100%",
          minHeight: UPLOAD_CONTAINER_HEIGHT,
        }}>
        {/* Error State */}
        {fileError && (
          <Box
            sx={{
              p: 3,
              minHeight: UPLOAD_CONTAINER_HEIGHT,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}>
            <Alert
              severity="error"
              sx={{ borderRadius: 2, width: "100%", maxWidth: 480 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setFileError(null)}>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Upload Failed
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {fileError}
              </Typography>
            </Alert>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleBrowseFiles}>
                Browse Files
              </Button>
              <Button variant="outlined" onClick={() => setFileError(null)}>
                Dismiss
              </Button>
            </Stack>
          </Box>
        )}

        {/* Uploading State */}
        {isUploading && selectedFile && (
          <Box
            sx={{
              p: 3,
              minHeight: UPLOAD_CONTAINER_HEIGHT,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}>
            <Box sx={{ position: "relative" }}>
              <CircularProgress
                variant="determinate"
                value={uploadProgress}
                size={64}
                thickness={4}
                sx={{
                  color: theme.palette.primary.main,
                  "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {Math.round(uploadProgress)}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Uploading {selectedFile?.name || "file"}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                width: "80%",
                maxWidth: 480,
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {/* Successfully Uploaded State */}
        {showUploadedState && (
          <Box
            sx={{
              p: 2,
              minHeight: UPLOAD_CONTAINER_HEIGHT,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 1.5,
              bgcolor: alpha(theme.palette.success.main, 0.05),
            }}>
            {/* Success Icon and Message */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CloudDoneIcon sx={{ fontSize: 20, color: "success.main" }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "success.main" }}>
                Upload Successful
              </Typography>
            </Box>

            {/* File Details */}
            <Box
              sx={{
                width: "100%",
                maxWidth: 480,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                bgcolor: alpha(theme.palette.success.main, 0.02),
              }}>
              {/* File Type Icon */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  flexShrink: 0,
                }}>
                {React.createElement(getFileTypeInfo(selectedFile?.type).icon, {
                  sx: {
                    fontSize: 16,
                    color: theme.palette.success.main,
                  },
                })}
              </Box>

              {/* File Details */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Tooltip title={selectedFile?.name || "Unknown file"}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "text.primary",
                    }}>
                    {selectedFile?.name || "Unknown file"}
                  </Typography>
                </Tooltip>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem" }}>
                  {formatFileSize(selectedFile?.size)} •{" "}
                  {getFileTypeInfo(selectedFile?.type).ext}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleBrowseFiles}
                sx={{
                  fontSize: "0.75rem",
                  py: 0.5,
                  px: 1.5,
                  minWidth: "auto",
                }}>
                Replace
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleDeleteFile}
                startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontSize: "0.75rem",
                  py: 0.5,
                  px: 1.5,
                  minWidth: "auto",
                }}>
                Remove
              </Button>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem", textAlign: "center" }}>
              You can replace or remove the file before analyzing
            </Typography>
          </Box>
        )}

        {/* Initial Upload State */}
        {!selectedFile && !fileError && (
          <Box
            component="label"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              minHeight: UPLOAD_CONTAINER_HEIGHT,
              width: "100%",
              textAlign: "center",
              cursor: "pointer",
              bgcolor: dragActive
                ? alpha(theme.palette.primary.main, 0.04)
                : "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              p: 3,
              gap: 1,
            }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileInput}
              style={{ display: "none" }}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: dragActive
                  ? theme.palette.primary.main
                  : alpha(theme.palette.primary.main, 0.08),
                color: dragActive ? "white" : "primary.main",
                transition: "all 0.3s ease",
                mb: 1,
              }}>
              <FileUploadIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {dragActive ? "Drop file here" : "Click to upload or drag & drop"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports PDF, DOCX, and DOC files up to {5}MB
            </Typography>
          </Box>
        )}

        {/* Hidden input for Replace button when file already selected */}
        {selectedFile && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileInput}
            style={{ display: "none" }}
          />
        )}
      </Paper>

      {/* Analyze Button */}
      <Box sx={{ textAlign: "center" }}>
        <PrimaryButton
          onClick={typeof onAnalyze === "function" ? onAnalyze : undefined}
          disabled={
            !showUploadedState || isAnalyzing || typeof onAnalyze !== "function"
          }
          size="large"
          startIcon={
            isAnalyzing ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <AssessmentIcon />
            )
          }
          sx={{
            minWidth: PRIMARY_BUTTON_MIN_WIDTH,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: 2,
            background:
              showUploadedState && !isAnalyzing
                ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                : undefined,
            "&:hover": {
              background:
                showUploadedState && !isAnalyzing
                  ? "linear-gradient(45deg, #1976d2 30%, #1e88e5 90%)"
                  : undefined,
              transform:
                showUploadedState && !isAnalyzing ? "translateY(-1px)" : "none",
            },
          }}>
          {isAnalyzing ? "Analyzing Resume..." : "Analyze Resume"}
        </PrimaryButton>

        {!selectedFile && !fileError && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, fontStyle: "italic" }}>
            Please upload a resume file to enable analysis
          </Typography>
        )}
      </Box>

      {/* Analysis Progress (inline card beneath button when analyzing) */}
      {isAnalyzing && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CircularProgress size={24} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Analyzing your resume...
                </Typography>
              </Stack>
              <LinearProgress
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center" }}>
                This may take a few moments while we analyze your resume against
                the job description
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ResumeUploadPage;
