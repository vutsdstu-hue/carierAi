import { Router, type Request, type Response } from "express";
import { z } from "zod";

import { prisma } from "@/utils/prisma";
import { requireAuth } from "@/middleware/auth";

const router = Router();

const JobStatusSchema = z.enum(["Отклик отправлен", "В процессе", "Получен ответ", "Отклонен"]);

const JobApplicationBodySchema = z.object({
  jobId: z.string().min(1),
  company: z.string().min(1),
  position: z.string().min(1),
  status: JobStatusSchema,
  date: z.string().min(1),
});

router.get("/job-applications", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const apps = await prisma.jobApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    apps.map((a: { id: string; jobId: string; company: string; position: string; status: string; date: string }) => ({
      id: a.id,
      jobId: a.jobId,
      company: a.company,
      position: a.position,
      status: a.status as any,
      date: a.date,
    }))
  );
});

router.post("/job-applications", requireAuth, async (req: Request, res: Response) => {
  const parsed = JobApplicationBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid job application payload", errors: parsed.error.flatten() });
  }

  const userId = req.user!.id;
  const { jobId, company, position, status, date } = parsed.data;

  const existing = await prisma.jobApplication.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });

  const upserted = await prisma.jobApplication.upsert({
    where: { userId_jobId: { userId, jobId } },
    create: { userId, jobId, company, position, status, date },
    update: { company, position, status, date },
  });

  await prisma.jobApplicationLog.create({
    data: {
      jobApplicationId: upserted.id,
      jobId: upserted.jobId,
      actorUserId: userId,
      action: existing ? "UPDATED" : "CREATED",
      fromStatus: existing?.status ?? null,
      toStatus: upserted.status,
    },
  });

  res.json({
    id: upserted.id,
    jobId: upserted.jobId,
    company: upserted.company,
    position: upserted.position,
    status: upserted.status as any,
    date: upserted.date,
  });
});

router.delete("/job-applications/:jobId", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const jobId = req.params.jobId;

  const existing = await prisma.jobApplication.findUnique({
    where: { userId_jobId: { userId, jobId } },
  });

  if (!existing) return res.status(404).json({ message: "Job application not found" });

  await prisma.jobApplication.delete({ where: { userId_jobId: { userId, jobId } } });

  await prisma.jobApplicationLog.create({
    data: {
      jobApplicationId: existing.id,
      jobId: existing.jobId,
      actorUserId: userId,
      action: "DELETED",
      fromStatus: existing.status,
      toStatus: null,
    },
  });

  res.json({ ok: true });
});

export default router;

