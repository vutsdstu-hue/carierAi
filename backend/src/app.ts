import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRouter from "@/routes/auth";
import profileRouter from "@/routes/profile";
import testsRouter from "@/routes/tests";
import testDefinitionsRouter from "@/routes/testDefinitions";
import jobApplicationsRouter from "@/routes/jobApplications";
import moderationRouter from "@/routes/moderation";
import adminRouter from "@/routes/admin";
import jobsRouter from "@/routes/jobs";

dotenv.config();

export const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: false,
  })
);

// For serving uploaded avatars
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api", profileRouter);
app.use("/api", testsRouter);
app.use("/api", testDefinitionsRouter);
app.use("/api", jobApplicationsRouter);
app.use("/api", moderationRouter);
app.use("/api", adminRouter);
app.use("/api", jobsRouter);

// Basic 404
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

