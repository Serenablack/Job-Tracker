import express from "express";
import jobRoutes from "./jobRoutes.js";
import resumeRoutes from "./resumeRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Backend is running");
});

router.use("/jobs", jobRoutes);
router.use("/resume", resumeRoutes);

export default router;
