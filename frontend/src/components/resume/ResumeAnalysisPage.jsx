import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Collapse,
  IconButton,
  Chip,
} from "@mui/material";
import { PrimaryButton } from "../common";
import { useTheme } from "@mui/material/styles";
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { MetricBox, ProgressBox, ListBox } from "../common";

const ResumeAnalysisPage = ({
  comparisonResult,
  isAnalyzing = false,
  onGenerateTrigger,
}) => {
  const theme = useTheme();
  const [expandedSkills, setExpandedSkills] = useState({
    matched: false,
    missing: false,
  });
  const [animatedScores, setAnimatedScores] = useState({});

  // Memoized data processing
  const processedData = useMemo(() => {
    if (!comparisonResult || typeof comparisonResult !== "object") {
      return null;
    }

    const formatScore = (score) => {
      if (score === null || score === undefined) return 0;
      if (typeof score === "number") return Math.round(score);
      if (typeof score === "string") {
        const parsed = parseFloat(score);
        return isNaN(parsed) ? 0 : Math.round(parsed);
      }
      return 0;
    };

    return {
      atsScore: formatScore(
        comparisonResult.atsScore || comparisonResult.overallScore || 0
      ),
      skillsMatch: formatScore(comparisonResult.skillsMatch || 0),
      keywordMatch: formatScore(comparisonResult.keywordMatch || 0),
      matchedSkills: Array.isArray(comparisonResult.matchedSkills)
        ? comparisonResult.matchedSkills
        : [],
      missingSkills: Array.isArray(comparisonResult.missingSkills)
        ? comparisonResult.missingSkills
        : [],
      recommendations: Array.isArray(comparisonResult.recommendations)
        ? comparisonResult.recommendations
        : Array.isArray(comparisonResult.suggestions)
        ? comparisonResult.suggestions
        : [],
    };
  }, [comparisonResult]);

  // Simplified animation logic
  useEffect(() => {
    if (!processedData) return;

    const animationDuration = 1000;
    const steps = 30;
    const stepDuration = animationDuration / steps;

    const animateScore = (targetScore, key) => {
      if (
        typeof targetScore !== "number" ||
        isNaN(targetScore) ||
        targetScore <= 0
      ) {
        setAnimatedScores((prev) => ({ ...prev, [key]: targetScore }));
        return;
      }

      let currentScore = 0;
      const increment = targetScore / steps;

      const interval = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
          currentScore = targetScore;
          clearInterval(interval);
        }

        setAnimatedScores((prev) => ({
          ...prev,
          [key]: Math.round(currentScore),
        }));
      }, stepDuration);
    };

    // Animate scores
    animateScore(processedData.atsScore, "atsScore");
    animateScore(processedData.skillsMatch, "skillsMatch");
    animateScore(processedData.keywordMatch, "keywordMatch");
  }, [processedData]);

  const handleSkillExpand = useCallback((skillType) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [skillType]: !prev[skillType],
    }));
  }, []);

  const getScoreColor = useCallback((score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  }, []);

  // Loading state
  if (isAnalyzing || !processedData) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
          gap: 2,
          minHeight: "400px",
        }}>
        <CircularProgress size={60} thickness={4} />
        <Typography
          variant="subtitle1"
          sx={{
            color: "text.secondary",
            textAlign: "center",
            fontSize: "1.125rem",
            fontWeight: 500,
            lineHeight: 1.6,
          }}>
          {isAnalyzing
            ? "Analyzing your resume match..."
            : "No analysis data available"}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            textAlign: "center",
            fontSize: "0.875rem",
            fontWeight: 400,
            lineHeight: 1.5,
          }}>
          {isAnalyzing
            ? "This may take a moment to complete the analysis."
            : "Please upload a resume to get started."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* ATS Score Section */}
      <ProgressBox
        score={animatedScores.atsScore ?? processedData.atsScore}
        title="Resume Match Analysis"
        icon={AssessmentIcon}
        color={getScoreColor(processedData.atsScore)}
        height={20}
        variant="circular"
        size={80}
      />

      {/* Detailed Metrics Grid */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: "120px" }}>
          <MetricBox
            icon={SpeedIcon}
            value={animatedScores.skillsMatch ?? processedData.skillsMatch}
            title="Skills Match"
            subtitle="Technical skills"
            color={getScoreColor(processedData.skillsMatch)}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: "120px" }}>
          <MetricBox
            icon={VisibilityIcon}
            value={animatedScores.keywordMatch ?? processedData.keywordMatch}
            title="ATS Keywords"
            subtitle="Keyword optimization"
            color={getScoreColor(processedData.keywordMatch)}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: "120px" }}>
          <MetricBox
            icon={TrendingUpIcon}
            value={processedData.matchedSkills.length}
            title="Matched Skills"
            subtitle="Skills found"
            color="success"
          />
        </Box>
      </Box>

      {/* Skills Analysis */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexDirection: { xs: "column", md: "row" },
        }}>
        {processedData.matchedSkills.length > 0 && (
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                p: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: "background.paper",
              }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SpeedIcon
                    sx={{ fontSize: 18, color: "success.main", mr: 0.5 }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      fontSize: "0.85rem",
                    }}>
                    ✓ Matched Skills ({processedData.matchedSkills.length})
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => handleSkillExpand("matched")}
                  size="small">
                  {expandedSkills.matched ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>

              <Collapse in={expandedSkills.matched}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {processedData.matchedSkills.map((skill, index) => (
                    <Chip
                      key={`matched-${index}`}
                      label={skill}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Collapse>
            </Box>
          </Box>
        )}

        {processedData.missingSkills.length > 0 && (
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                p: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: "background.paper",
              }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <VisibilityIcon
                    sx={{ fontSize: 18, color: "error.main", mr: 0.5 }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      fontSize: "0.85rem",
                    }}>
                    ⚠ Missing Skills ({processedData.missingSkills.length})
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => handleSkillExpand("missing")}
                  size="small">
                  {expandedSkills.missing ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>

              <Collapse in={expandedSkills.missing}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {processedData.missingSkills.map((skill, index) => (
                    <Chip
                      key={`missing-${index}`}
                      label={skill}
                      color="error"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Collapse>
            </Box>
          </Box>
        )}
      </Box>

      {/* Recommendations Section */}
      {processedData.recommendations.length > 0 && (
        <ListBox
          title="Optimization Recommendations"
          items={processedData.recommendations}
          icon={TrendingUpIcon}
          color="primary"
          maxDisplay={8}
          emptyMessage="No recommendations available"
        />
      )}

      {/* Action Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: 1,
        }}>
        <PrimaryButton
          size="medium"
          startIcon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
          onClick={onGenerateTrigger}
          sx={{
            fontSize: "0.85rem",
            py: 1,
            px: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
            "&:hover": {
              background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
            },
          }}>
          Generate ATS-Optimized Resume
        </PrimaryButton>
      </Box>
    </Box>
  );
};

export default ResumeAnalysisPage;
