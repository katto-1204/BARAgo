import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable, residentsTable } from "@workspace/db";
import { RegisterUserBody, LoginUserBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { fullName, email, password, birthdate, age, gender, address, purok, contactNumber, emergencyContactName, emergencyContactNumber } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db.insert(usersTable).values({
    fullName,
    email,
    passwordHash,
    role: "resident",
    status: "active",
  }).returning();

  const [resident] = await db.insert(residentsTable).values({
    userId: user.id,
    birthdate: birthdate ?? null,
    age: age ?? null,
    gender: gender ?? null,
    address,
    purok: purok ?? null,
    contactNumber,
    emergencyContactName: emergencyContactName ?? null,
    emergencyContactNumber: emergencyContactNumber ?? null,
    verified: false,
  }).returning();

  req.session.user = { id: user.id, role: user.role, residentId: resident.id };

  const userOut = { ...user, resident: { ...resident, user } };
  res.status(201).json({ user: userOut });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.status === "disabled") {
    res.status(401).json({ error: "Account disabled" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const [resident] = await db.select().from(residentsTable).where(eq(residentsTable.userId, user.id));

  req.session.user = { id: user.id, role: user.role, residentId: resident?.id };

  const userOut = resident ? { ...user, resident: { ...resident, user } } : { ...user, resident: null };
  res.json({ user: userOut });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.json({ success: true });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.user.id));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const [resident] = await db.select().from(residentsTable).where(eq(residentsTable.userId, user.id));
  const userOut = resident ? { ...user, resident: { ...resident, user } } : { ...user, resident: null };
  res.json(userOut);
});

export default router;
