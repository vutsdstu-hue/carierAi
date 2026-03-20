import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { z } from "zod";

const JwtPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]),
});

export type AuthenticatedUser = {
  id: string;
  role: "USER" | "MODERATOR" | "ADMIN";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header("Authorization");
    if (!header) return res.status(401).json({ message: "Missing Authorization header" });

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Invalid Authorization header format" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "dev_secret");
    const parsed = JwtPayloadSchema.safeParse(payload);
    if (!parsed.success) return res.status(401).json({ message: "Invalid token payload" });

    req.user = { id: parsed.data.sub, role: parsed.data.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

