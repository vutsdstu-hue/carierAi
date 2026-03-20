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

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: { status },
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

    const result = await prisma.jobApplication.updateMany({
      where: { jobId },
      data: { status },
    });

    res.json({ ok: true, updatedCount: result.count });
  }
);

router.delete(
  "/moderation/job-applications/:id",
  requireAuth,
  requireRole(["MODERATOR", "ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    await prisma.jobApplication.delete({ where: { id } });
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

