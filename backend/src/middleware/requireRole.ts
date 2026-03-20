import type { Request, Response, NextFunction } from "express";

export function requireRole(allowed: Array<"USER" | "MODERATOR" | "ADMIN">) {
  return function (req: Request, res: Response, next: NextFunction) {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: "Unauthorized" });
    if (!allowed.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

