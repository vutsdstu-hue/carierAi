import { Router } from "express";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/utils/prisma";
import { requireAuth } from "@/middleware/auth";
type DbRole = "USER" | "MODERATOR" | "ADMIN";

const router = Router();

const RegisterBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  location: z.string().min(1).optional().default("—"),
  position: z.string().min(1).optional().default("—"),
  experience: z.string().min(1).optional().default("—"),
  level: z.string().min(1).optional().default("—"),
  avatar: z.string().min(1).optional().default("—"),
  joinDate: z.string().min(1).optional().default(new Date().toISOString().slice(0, 10)),
});

const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(userId: string, role: DbRole) {
  const secret = process.env.JWT_SECRET ?? "dev_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
  // jsonwebtoken types are a bit strict with option overloads; cast keeps runtime correct.
  return jwt.sign({ sub: userId, role }, secret, { expiresIn } as any);
}

function toFrontendUser(u: {
  id: string;
  email: string;
  name: string;
  location: string;
  avatar: string;
  position: string;
  experience: string;
  level: string;
  joinDate: string;
  role: DbRole;
}) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    name: u.name,
    location: u.location,
    avatar: u.avatar,
    position: u.position,
    experience: u.experience,
    level: u.level,
    joinDate: u.joinDate,
  };
}

router.post("/register", async (req, res) => {
  const parsed = RegisterBodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid register payload", errors: parsed.error.flatten() });

  const { email, password, name, location, position, experience, level, avatar, joinDate } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "Email is already registered" });

  const passwordHash = await bcryptjs.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      location,
      position,
      experience,
      level,
      avatar,
      joinDate,
    },
  });

  const token = signToken(user.id, user.role);
  return res.json({ token, user: toFrontendUser(user) });
});

router.post("/login", async (req, res) => {
  const parsed = LoginBodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid login payload", errors: parsed.error.flatten() });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const ok = await bcryptjs.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password" });

  const token = signToken(user.id, user.role);
  return res.json({ token, user: toFrontendUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!u) return res.status(404).json({ message: "User not found" });
  return res.json({ user: toFrontendUser(u) });
});

export default router;

