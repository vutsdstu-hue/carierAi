import { Router } from "express";
import { z } from "zod";

import { prisma } from "@/utils/prisma";
import { requireAuth } from "@/middleware/auth";

const router = Router();

const UserBodySchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  avatar: z.string().min(1),
  position: z.string().min(1),
  experience: z.string().min(1),
  level: z.string().min(1),
  joinDate: z.string().min(1),
});

const SkillSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(0).max(100),
  category: z.string().min(1),
});

router.get("/profile", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const [user, skills] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.skill.findMany({ where: { userId }, orderBy: { category: "asc" } }),
  ]);

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      location: user.location,
      avatar: user.avatar,
      position: user.position,
      experience: user.experience,
      level: user.level,
      joinDate: user.joinDate,
    },
    skills: skills.map((s: { name: string; level: number; category: string }) => ({
      name: s.name,
      level: s.level,
      category: s.category,
    })),
  });
});

router.put("/profile", requireAuth, async (req, res) => {
  const bodySchema = z.object({
    user: UserBodySchema,
    skills: z.array(SkillSchema),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid profile payload", errors: parsed.error.flatten() });
  }

  const userId = req.user!.id;
  const { user, skills } = parsed.data;

  await prisma.$transaction(async (tx: any) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        name: user.name,
        location: user.location,
        avatar: user.avatar,
        position: user.position,
        experience: user.experience,
        level: user.level,
        joinDate: user.joinDate,
      },
    });

    // Replace user's skills set (simple and predictable)
    await tx.skill.deleteMany({ where: { userId } });

    if (skills.length > 0) {
      await tx.skill.createMany({
        data: skills.map((s: { name: string; level: number; category: string }) => ({
          userId,
          name: s.name,
          level: s.level,
          category: s.category,
        })),
      });
    }
  });

  return res.json({ ok: true });
});

export default router;

