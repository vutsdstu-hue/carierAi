import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "@/routes/auth";
import profileRouter from "@/routes/profile";
import testsRouter from "@/routes/tests";
import jobApplicationsRouter from "@/routes/jobApplications";
import moderationRouter from "@/routes/moderation";
import adminRouter from "@/routes/admin";

dotenv.config();

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: false,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api", profileRouter);
app.use("/api", testsRouter);
app.use("/api", jobApplicationsRouter);
app.use("/api", moderationRouter);
app.use("/api", adminRouter);

// Basic 404
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

