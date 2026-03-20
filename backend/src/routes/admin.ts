import { Router } from "express";
import { z } from "zod";

import { prisma } from "@/utils/prisma";
import { requireAuth } from "@/middleware/auth";
import { requireRole } from "@/middleware/requireRole";

const router = Router();

type DbRole = "USER" | "MODERATOR" | "ADMIN";
const RoleSchema = z.enum(["USER", "MODERATOR", "ADMIN"]);
const UpdateRoleBodySchema = z.object({ role: RoleSchema });

router.get(
  "/admin/users",
  requireAuth,
  requireRole(["ADMIN"]),
  async (_req, res) => {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      users.map((u: { id: string; email: string; name: string; role: DbRole }) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as DbRole,
      }))
    );
  }
);

router.patch(
  "/admin/users/:id/role",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const parsed = UpdateRoleBodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: parsed.data.role as any },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json(updated);
  }
);

router.delete(
  "/admin/users/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }
);

router.get(
  "/admin/stats",
  requireAuth,
  requireRole(["ADMIN"]),
  async (_req, res) => {
    const [userCount, moderatorCount, adminCount, skillsCount, testsCount, appsCount] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "MODERATOR" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.skill.count(),
      prisma.testResult.count(),
      prisma.jobApplication.count(),
    ]);

    res.json({
      users: { USER: userCount, MODERATOR: moderatorCount, ADMIN: adminCount },
      skillsCount,
      testsCount,
      jobApplicationsCount: appsCount,
    });
  }
);

export default router;

