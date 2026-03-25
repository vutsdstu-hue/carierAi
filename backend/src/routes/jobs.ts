import { Router } from "express";
import { z } from "zod";

import { prisma } from "@/utils/prisma";
import { requireAuth } from "@/middleware/auth";
import { requireRole } from "@/middleware/requireRole";

const router = Router();

const JobBodySchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1),
  salary: z.string().min(1).optional().default("—"),
  type: z.string().min(1).optional().default("—"),
  description: z.string().min(1).optional().default("—"),
  skills: z.array(z.string().min(1)).min(1),
  postedTime: z.string().min(1).optional().default("—"),
  aiMatch: z.number().int().min(0).max(100).optional(),
});

router.get("/jobs", requireAuth, async (_req, res) => {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(jobs);
});

router.get(
  "/admin/jobs",
  requireAuth,
  requireRole(["ADMIN"]),
  async (_req, res) => {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(jobs);
  }
);

router.post(
  "/admin/jobs",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const parsed = JobBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const job = await prisma.job.create({
      data: parsed.data,
    });

    res.json(job);
  }
);

router.patch(
  "/admin/jobs/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const parsed = JobBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    res.json(updated);
  }
);

router.delete(
  "/admin/jobs/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }
);

export default router;

