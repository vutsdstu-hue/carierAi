import { Router } from "express";
import { z } from "zod";

import { prisma } from "@/utils/prisma";
import { requireAuth } from "@/middleware/auth";

const router = Router();

const AnswersSchema = z.array(z.number().int().min(-1));
const TestResultBodySchema = z.object({
  testId: z.string().min(1),
  testTitle: z.string().min(1),
  score: z.number().int().min(0).max(100),
  date: z.string().min(1),
  answers: AnswersSchema,
  timeSpent: z.number().int().min(0),
});

router.get("/tests", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const results = await prisma.testResult.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });

  res.json(
    results.map((r: { testId: string; testTitle: string; score: number; date: string; answers: unknown; timeSpent: number }) => ({
      testId: r.testId,
      testTitle: r.testTitle,
      score: r.score,
      date: r.date,
      answers: r.answers as number[],
      timeSpent: r.timeSpent,
    }))
  );
});

router.post("/tests/results", requireAuth, async (req, res) => {
  const parsed = TestResultBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid test result payload", errors: parsed.error.flatten() });
  }

  const userId = req.user!.id;
  const data = parsed.data;

  const upserted = await prisma.testResult.upsert({
    where: { userId_testId: { userId, testId: data.testId } },
    create: {
      userId,
      testId: data.testId,
      testTitle: data.testTitle,
      score: data.score,
      date: data.date,
      answers: data.answers,
      timeSpent: data.timeSpent,
    },
    update: {
      testTitle: data.testTitle,
      score: data.score,
      date: data.date,
      answers: data.answers,
      timeSpent: data.timeSpent,
    },
  });

  res.json({
    testId: upserted.testId,
    testTitle: upserted.testTitle,
    score: upserted.score,
    date: upserted.date,
    answers: upserted.answers as number[],
    timeSpent: upserted.timeSpent,
  });
});

router.delete("/tests/:testId", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const testId = req.params.testId;

  await prisma.testResult.delete({
    where: { userId_testId: { userId, testId } },
  });

  res.json({ ok: true });
});

export default router;

