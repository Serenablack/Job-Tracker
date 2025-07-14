import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Job Tracker API is running!" });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

import routes from "./routes/index.js";

app.use("/api/v1", routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
