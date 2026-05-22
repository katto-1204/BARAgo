import bcrypt from "bcryptjs";
import { db, pool } from "./index";
import { usersTable, residentsTable } from "./schema";

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("admin123", 10);

  // Check if admin already exists
  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.length > 0) {
    console.log("Database already contains users. Skipping seed.");
    return;
  }

  console.log("Creating seed users...");

  // 1. Create Admin
  const [adminUser] = await db.insert(usersTable).values({
    fullName: "System Admin",
    email: "admin@barago.ph",
    passwordHash,
    role: "admin",
    status: "active",
  }).returning();

  console.log(`Created Admin: ${adminUser.email}`);

  // 2. Create Health Worker
  const [workerUser] = await db.insert(usersTable).values({
    fullName: "Health Worker",
    email: "worker@barago.ph",
    passwordHash,
    role: "health_worker",
    status: "active",
  }).returning();

  console.log(`Created Health Worker: ${workerUser.email}`);

  // 3. Create Resident (Juan)
  const [juanUser] = await db.insert(usersTable).values({
    fullName: "Juan Dela Cruz",
    email: "juan@barago.ph",
    passwordHash,
    role: "resident",
    status: "active",
  }).returning();

  console.log(`Created Resident User: ${juanUser.email}`);

  // Create Resident details for Juan
  const [juanResident] = await db.insert(residentsTable).values({
    userId: juanUser.id,
    birthdate: "1990-01-01",
    age: 36,
    gender: "male",
    address: "Purok 1, Barangay Bagong Pag-asa",
    purok: "Purok 1",
    contactNumber: "09123456789",
    emergencyContactName: "Maria Dela Cruz",
    emergencyContactNumber: "09987654321",
    verified: true,
  }).returning();

  console.log(`Created Resident profile for Juan Dela Cruz`);
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
