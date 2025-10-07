import React, { useState } from "react";
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
  AutoFixHigh as GenerateIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { PrimaryButton, SecondaryButton } from "../common";

const ResumeGeneratePage = ({ analysisData, onGenerateComplete, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Simulate generation process
    setTimeout(() => {
      const mockGeneratedResume = {
        id: "resume_123",
        filename: "optimized_resume.pdf",
        downloadUrl: "#",
        improvements: [
          "Added missing Python skills to experience section",
          "Enhanced professional summary with key keywords",
          "Reorganized skills section for better ATS compatibility",
          "Updated job descriptions with relevant keywords",
          "Improved formatting for better readability",
        ],
      };

      setGeneratedResume(mockGeneratedResume);
      setIsGenerating(false);
      onGenerateComplete(mockGeneratedResume);
    }, 2000);
  };

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
          <GenerateIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Generate Optimized Resume
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create an ATS-friendly version of your resume
          </Typography>
        </Box>

        {!generatedResume ? (
          <>
            {/* Analysis Summary */}
            {analysisData && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Analysis Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "success.50",
                        borderRadius: 2,
                      }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "success.main" }}>
                        {analysisData.matchPercentage}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Current Match
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        bgcolor: "warning.50",
                        borderRadius: 2,
                      }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "warning.main" }}>
                        {analysisData.missingSkills.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Missing Skills
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Missing Skills */}
            {analysisData?.missingSkills?.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Skills to be Added
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {analysisData.missingSkills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      color="warning"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Generate Button */}
            <Box sx={{ textAlign: "center" }}>
              <PrimaryButton
                onClick={handleGenerate}
                disabled={isGenerating}
                size="large"
                startIcon={isGenerating ? null : <GenerateIcon />}
                sx={{ px: 4 }}>
                {isGenerating ? "Generating..." : "Generate Optimized Resume"}
              </PrimaryButton>
            </Box>
          </>
        ) : (
          <>
            {/* Success Message */}
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Resume Generated Successfully!
              </Typography>
              <Typography variant="body2">
                Your ATS-optimized resume is ready for download.
              </Typography>
            </Alert>

            {/* Improvements Made */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <CheckIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Improvements Made
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {generatedResume.improvements.map((improvement, index) => (
                  <Alert key={index} severity="info" sx={{ py: 1 }}>
                    {improvement}
                  </Alert>
                ))}
              </Box>
            </Box>

            {/* Download Options */}
            <Box sx={{ textAlign: "center" }}>
              <Grid container spacing={2} justifyContent="center">
                <Grid item>
                  <PrimaryButton
                    onClick={handleDownload}
                    startIcon={<DownloadIcon />}
                    size="large"
                    sx={{ px: 4 }}>
                    Download PDF
                  </PrimaryButton>
                </Grid>
                <Grid item>
                  <SecondaryButton onClick={onBack} size="large" sx={{ px: 4 }}>
                    Back to Analysis
                  </SecondaryButton>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeGeneratePage;
