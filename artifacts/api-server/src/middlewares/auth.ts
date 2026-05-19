import { type Request, type Response, type NextFunction } from "express";

export function requireAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function requireAdminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.session.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

export function requireAdminOrHealthWorker(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.session.user.role !== "admin" && req.session.user.role !== "health_worker") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
