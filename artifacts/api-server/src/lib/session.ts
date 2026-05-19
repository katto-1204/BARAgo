import { type Request } from "express";

export interface SessionUser {
  id: string;
  role: string;
  residentId?: string;
}

declare global {
  namespace Express {
    interface Request {
      session: {
        user?: SessionUser;
      };
    }
  }
}

export function getSessionUser(req: Request): SessionUser | null {
  return req.session?.user ?? null;
}

export function requireAuth(req: Request): SessionUser {
  const user = getSessionUser(req);
  if (!user) throw new Error("Unauthorized");
  return user;
}
