import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Visibility as VisibilityIcon,
  AutoAwesome as AutoAwesomeIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { MetricBox, SkillsBox, ProgressBox, ListBox } from "../common";
import { getTypographyProps } from "../../utils/typography";

const ResumeAnalysisPage = ({
  comparisonResult,
  isAnalyzing,
  onGenerateTrigger,
}) => {
  const theme = useTheme();

  if (isAnalyzing || !comparisonResult) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
          gap: 2,
        }}>
        <CircularProgress size={60} thickness={4} />
        <Typography
          {...getTypographyProps("subtitle", {
            sx: { color: "text.secondary", textAlign: "center" },
          })}>
          Analyzing your resume match...
        </Typography>
        <Typography
          {...getTypographyProps("small", {
            sx: { color: "text.secondary", textAlign: "center" },
          })}>
          This may take a moment to complete the analysis.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Overall Score Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ProgressBox
            score={comparisonResult.overallScore}
            title="Resume Match Analysis"
            icon={AssessmentIcon}
            color="primary"
            height={20}
          />
        </Grid>
      </Grid>

      {/* Detailed Metrics Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricBox
            icon={SpeedIcon}
            score={comparisonResult.skillsMatch}
            title="Skills Match"
            subtitle="Technical skills alignment"
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricBox
            icon={VisibilityIcon}
            score={comparisonResult.keywordMatch}
            title="ATS Keywords"
            subtitle="Keyword optimization"
            color="success"
          />
        </Grid>
      </Grid>

      {/* Skills Analysis Grid */}
      <Grid container spacing={3}>
        {comparisonResult.matchedSkills?.length > 0 && (
          <Grid item xs={12} md={6}>
            <SkillsBox
              title="✓ Matched Skills"
              skills={comparisonResult.matchedSkills}
              color="success"
              variant="outlined"
              maxDisplay={15}
              emptyMessage="No matching skills found"
            />
          </Grid>
        )}

        {comparisonResult.missingSkills?.length > 0 && (
          <Grid item xs={12} md={6}>
            <SkillsBox
              title="⚠ Missing Skills"
              skills={comparisonResult.missingSkills}
              color="error"
              variant="outlined"
              maxDisplay={15}
              emptyMessage="No missing skills identified"
            />
          </Grid>
        )}
      </Grid>

      {/* Recommendations Section */}
      {comparisonResult.recommendations?.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ListBox
              title="Optimization Recommendations"
              items={comparisonResult.recommendations}
              icon={TrendingUpIcon}
              color="primary"
              maxDisplay={10}
              iconColor="primary"
              emptyMessage="No recommendations available"
            />
          </Grid>
        </Grid>
      )}

      {/* Action Button */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              pt: 2,
            }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AutoAwesomeIcon />}
              onClick={onGenerateTrigger}
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                py: 1.5,
                px: 4,
                borderRadius: 2,
                boxShadow: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                },
                transition: "all 0.3s ease",
              }}>
              Generate ATS-Optimized Resume
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResumeAnalysisPage;
