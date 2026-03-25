import { Router } from "express";
import { z } from "zod";

import { prisma } from "@/utils/prisma";
import { requireAuth } from "@/middleware/auth";
import { requireRole } from "@/middleware/requireRole";

const router = Router();

const JobStatusSchema = z.enum(["Отклик отправлен", "В процессе", "Получен ответ", "Отклонен"]);
const UpdateBodySchema = z.object({ status: JobStatusSchema });

router.get(
  "/moderation/job-applications",
  requireAuth,
  requireRole(["MODERATOR", "ADMIN"]),
  async (_req, res) => {
    const apps = await prisma.jobApplication.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      apps.map(
        (a: {
          id: string;
          jobId: string;
          company: string;
          position: string;
          status: string;
          date: string;
          user: { id: string; name: string; email: string };
        }) => ({
          id: a.id,
          jobId: a.jobId,
          company: a.company,
          position: a.position,
          status: a.status,
          date: a.date,
          user: {
            id: a.user.id,
            name: a.user.name,
            email: a.user.email,
          },
        })
      )
    );
  }
);

router.patch(
  "/moderation/job-applications/:id",
  requireAuth,
  requireRole(["MODERATOR", "ADMIN"]),
  async (req, res) => {
    const parsed = UpdateBodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });

    const { status } = parsed.data;
    const { id } = req.params;

    const existing = await prisma.jobApplication.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Job application not found" });

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: { status },
    });

    await prisma.jobApplicationLog.create({
      data: {
        jobApplicationId: updated.id,
        jobId: updated.jobId,
        actorUserId: req.user!.id,
        action: "STATUS_CHANGED",
        fromStatus: existing.status,
        toStatus: updated.status,
      },
    });

    res.json({
      id: updated.id,
      status: updated.status,
    });
  }
);

router.patch(
  "/moderation/job-applications/by-job/:jobId",
  requireAuth,
  requireRole(["MODERATOR", "ADMIN"]),
  async (req, res) => {
    const parsed = UpdateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
    }

    const { status } = parsed.data;
    const { jobId } = req.params;

    const existingApps = await prisma.jobApplication.findMany({
      where: { jobId },
      select: { id: true, status: true, jobId: true },
    });

    const result = await prisma.jobApplication.updateMany({
      where: { jobId },
      data: { status },
    });

    if (existingApps.length > 0) {
      await prisma.jobApplicationLog.createMany({
        data: existingApps.map((a) => ({
          jobApplicationId: a.id,
          jobId: a.jobId,
          actorUserId: req.user!.id,
          action: "STATUS_CHANGED",
          fromStatus: a.status,
          toStatus: status,
        })),
      });
    }

    res.json({ ok: true, updatedCount: result.count });
  }
);

router.delete(
  "/moderation/job-applications/:id",
  requireAuth,
  requireRole(["MODERATOR", "ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.jobApplication.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Job application not found" });

    await prisma.jobApplication.delete({ where: { id } });

    await prisma.jobApplicationLog.create({
      data: {
        jobApplicationId: id,
        jobId: existing.jobId,
        actorUserId: req.user!.id,
        action: "DELETED",
        fromStatus: existing.status,
        toStatus: null,
      },
    });
    res.json({ ok: true });
  }
);

router.get(
  "/moderation/test-results",
  requireAuth,
  requireRole(["MODERATOR", "ADMIN"]),
  async (_req, res) => {
    const results = await prisma.testResult.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { id: "desc" },
    });

    res.json(
      results.map(
        (r: {
          id: string;
          testId: string;
          testTitle: string;
          score: number;
          date: string;
          answers: unknown;
          timeSpent: number;
          user: { id: string; name: string; email: string };
        }) => ({
          id: r.id,
          user: { id: r.user.id, name: r.user.name, email: r.user.email },
          testId: r.testId,
          testTitle: r.testTitle,
          score: r.score,
          date: r.date,
          answers: r.answers as any,
          timeSpent: r.timeSpent,
        })
      )
    );
  }
);

router.delete(
  "/moderation/test-results/:id",
  requireAuth,
  requireRole(["MODERATOR", "ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    await prisma.testResult.delete({ where: { id } });
    res.json({ ok: true });
  }
);

export default router;

