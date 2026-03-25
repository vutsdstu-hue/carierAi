import { Router, type Request, type Response } from "express";

import { prisma } from "@/utils/prisma";
import { requireAuth } from "@/middleware/auth";

const router = Router();

router.get("/tests/definitions", requireAuth, async (_req: Request, res: Response) => {
  const defs = await prisma.testDefinition.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(
    defs.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      difficulty:
        t.difficulty === "BEGINNER"
          ? "Начальный"
          : t.difficulty === "INTERMEDIATE"
            ? "Средний"
            : t.difficulty === "ADVANCED"
              ? "Продвинутый"
              : "Эксперт",
      questions: t.questions as any,
      timeLimit: t.timeLimit,
      description: t.description,
    }))
  );
});

export default router;

