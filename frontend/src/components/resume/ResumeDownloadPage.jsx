import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
} from "@mui/material";
import {
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { PrimaryButton, SecondaryButton } from "../common";

const ResumeDownloadPage = ({ generatedResume, onReset, onBack }) => {
  const handleDownload = () => {
    if (generatedResume) {
      // Simulate download
      const link = document.createElement("a");
      link.href = generatedResume.downloadUrl;
      link.download = generatedResume.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleNewComparison = () => {
    onReset();
  };

  return (
    <Card
      sx={{
        maxWidth: 800,
        mx: "auto",
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
      }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <CheckIcon sx={{ fontSize: 48, color: "success.main", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Resume Optimization Complete!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your ATS-optimized resume is ready for download
          </Typography>
        </Box>

        {/* Success Alert */}
        <Alert severity="success" sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Optimization Successful
          </Typography>
          <Typography variant="body2">
            Your resume has been enhanced with missing keywords and optimized
            for ATS systems.
          </Typography>
        </Alert>

        {/* Resume Details */}
        {generatedResume && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Resume Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: "primary.50", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Filename
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {generatedResume.filename}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: "success.50", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "success.main" }}>
                    Ready for Download
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Improvements Summary */}
        {generatedResume?.improvements && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Key Improvements Made
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {generatedResume.improvements.map((improvement, index) => (
                <Alert key={index} severity="info" sx={{ py: 1 }}>
                  {improvement}
                </Alert>
              ))}
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ textAlign: "center" }}>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <PrimaryButton
                onClick={handleDownload}
                startIcon={<DownloadIcon />}
                size="large"
                sx={{ px: 4 }}>
                Download Resume
              </PrimaryButton>
            </Grid>
            <Grid item>
              <SecondaryButton
                onClick={handleNewComparison}
                startIcon={<RefreshIcon />}
                size="large"
                sx={{ px: 4 }}>
                Start New Comparison
              </SecondaryButton>
            </Grid>
            <Grid item>
              <SecondaryButton onClick={onBack} size="large" sx={{ px: 4 }}>
                Back to Analysis
              </SecondaryButton>
            </Grid>
          </Grid>
        </Box>

        {/* Tips */}
        <Box sx={{ mt: 4, p: 3, bgcolor: "info.50", borderRadius: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 2, color: "info.main" }}>
            💡 Pro Tips
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              • Customize the resume further based on specific job requirements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Keep your resume updated with new skills and experiences
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Use this tool for each job application to maximize your chances
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResumeDownloadPage;
