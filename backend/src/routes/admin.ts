import { Router } from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";
import multer from "multer";

import { prisma } from "@/utils/prisma";
import { requireAuth } from "@/middleware/auth";
import { requireRole } from "@/middleware/requireRole";

const router = Router();

type DbRole = "USER" | "MODERATOR" | "ADMIN";
const RoleSchema = z.enum(["USER", "MODERATOR", "ADMIN"]);
const UpdateRoleBodySchema = z.object({ role: RoleSchema });

const CreateUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  location: z.string().min(1).optional().default("—"),
  avatar: z.string().min(1).optional().default("—"),
  position: z.string().min(1).optional().default("—"),
  experience: z.string().min(1).optional().default("—"),
  level: z.string().min(1).optional().default("—"),
  joinDate: z.string().min(1).optional().default(new Date().toISOString().slice(0, 10)),
  role: RoleSchema.optional().default("USER"),
});

const TestDifficultySchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]);
const CreateTestBodySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  difficulty: TestDifficultySchema,
  timeLimit: z.number().int().min(1).max(240),
  description: z.string().min(1),
  questions: z.array(
    z.object({
      id: z.number().int().min(1),
      question: z.string().min(1),
      options: z.array(z.string().min(1)).min(2),
      correctAnswer: z.number().int().min(0),
      explanation: z.string().optional(),
    })
  ),
});

const uploadRoot = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadRoot),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".png";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

const UpdateUserBodySchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1).optional().default("—"),
  avatar: z.string().min(1).optional().default("—"),
  position: z.string().min(1).optional().default("—"),
  experience: z.string().min(1).optional().default("—"),
  level: z.string().min(1).optional().default("—"),
  joinDate: z.string().min(1).optional().default(new Date().toISOString().slice(0, 10)),
  role: RoleSchema.optional(),
  password: z.string().min(8).optional(),
});

const UpdateTestBodySchema = CreateTestBodySchema.omit({ id: true }).partial().extend({
  title: z.string().min(1),
  category: z.string().min(1),
  difficulty: TestDifficultySchema,
  timeLimit: z.number().int().min(1).max(240),
  description: z.string().min(1),
  questions: CreateTestBodySchema.shape.questions,
});

const UpdateLogBodySchema = z.object({
  hidden: z.boolean().optional(),
  note: z.string().max(2000).optional().nullable(),
});

router.get(
  "/admin/users",
  requireAuth,
  requireRole(["ADMIN"]),
  async (_req, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        location: true,
        avatar: true,
        position: true,
        experience: true,
        level: true,
        joinDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      users.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as DbRole,
        location: u.location,
        avatar: u.avatar,
        position: u.position,
        experience: u.experience,
        level: u.level,
        joinDate: u.joinDate,
      }))
    );
  }
);

router.post(
  "/admin/users",
  requireAuth,
  requireRole(["ADMIN"]),
  upload.single("avatar"),
  async (req, res) => {
    const parsed = CreateUserBodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });

    const { email, password, name, location, avatar, position, experience, level, joinDate, role } = parsed.data;
    const avatarValue =
      req.file?.filename ? `/uploads/avatars/${req.file.filename}` : avatar;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email is already registered" });

    const bcryptjs = (await import("bcryptjs")).default;
    const passwordHash = await bcryptjs.hash(password, 12);

    const created = await prisma.user.create({
      data: { email, passwordHash, name, location, avatar: avatarValue, position, experience, level, joinDate, role },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json(created);
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

router.patch(
  "/admin/users/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  upload.single("avatar"),
  async (req, res) => {
    const parsed = UpdateUserBodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });

    const avatarValue = req.file?.filename ? `/uploads/avatars/${req.file.filename}` : parsed.data.avatar;
    const bcryptjs = (await import("bcryptjs")).default;
    const passwordHash = parsed.data.password ? await bcryptjs.hash(parsed.data.password, 12) : undefined;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name: parsed.data.name,
        location: parsed.data.location,
        avatar: avatarValue,
        position: parsed.data.position,
        experience: parsed.data.experience,
        level: parsed.data.level,
        joinDate: parsed.data.joinDate,
        role: parsed.data.role as any,
        ...(passwordHash ? { passwordHash } : {}),
      },
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

router.get(
  "/admin/job-application-logs",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const QuerySchema = z.object({
      jobId: z.string().optional(),
    });
    const parsed = QuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid query", errors: parsed.error.flatten() });
    }

    const logs = await prisma.jobApplicationLog.findMany({
      where: {
        ...(parsed.data.jobId ? { jobId: parsed.data.jobId } : {}),
        hidden: false,
      },
      include: {
        actor: { select: { id: true, name: true, email: true } },
        jobApplication: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      logs.map((l) => ({
        id: l.id,
        jobApplicationId: l.jobApplicationId,
        jobId: l.jobId,
        applicant: {
          id: l.jobApplication.user.id,
          name: l.jobApplication.user.name,
          email: l.jobApplication.user.email,
        },
        actor: {
          id: l.actor.id,
          name: l.actor.name,
          email: l.actor.email,
        },
        action: l.action,
        fromStatus: l.fromStatus,
        toStatus: l.toStatus,
        note: l.note ?? null,
        hidden: l.hidden,
        createdAt: l.createdAt,
      }))
    );
  }
);

router.patch(
  "/admin/job-application-logs/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const parsed = UpdateLogBodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });

    const updated = await prisma.jobApplicationLog.update({
      where: { id: req.params.id },
      data: {
        ...(parsed.data.hidden === undefined ? {} : { hidden: parsed.data.hidden }),
        ...(parsed.data.note === undefined ? {} : { note: parsed.data.note }),
      },
    });

    res.json(updated);
  }
);

router.delete(
  "/admin/job-application-logs/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    await prisma.jobApplicationLog.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }
);

router.get(
  "/admin/tests",
  requireAuth,
  requireRole(["ADMIN"]),
  async (_req, res) => {
    const defs = await prisma.testDefinition.findMany({ orderBy: { createdAt: "desc" } });
    res.json(defs);
  }
);

router.post(
  "/admin/tests",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const parsed = CreateTestBodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });

    const created = await prisma.testDefinition.create({
      data: {
        id: parsed.data.id,
        title: parsed.data.title,
        category: parsed.data.category,
        difficulty: parsed.data.difficulty,
        timeLimit: parsed.data.timeLimit,
        description: parsed.data.description,
        questions: parsed.data.questions as any,
      },
    });

    res.json(created);
  }
);

router.delete(
  "/admin/tests/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    await prisma.testDefinition.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }
);

router.patch(
  "/admin/tests/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req, res) => {
    const parsed = UpdateTestBodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });

    const updated = await prisma.testDefinition.update({
      where: { id: req.params.id },
      data: {
        title: parsed.data.title,
        category: parsed.data.category,
        difficulty: parsed.data.difficulty,
        timeLimit: parsed.data.timeLimit,
        description: parsed.data.description,
        questions: parsed.data.questions as any,
      },
    });

    res.json(updated);
  }
);

export default router;

