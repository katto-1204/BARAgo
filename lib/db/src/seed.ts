// @ts-ignore
import bcrypt from "bcryptjs";
import { db, pool } from "./index";
import { usersTable, residentsTable, healthSchedulesTable } from "./schema";

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("admin123", 10);

  // Check if admin already exists
  const existingUsers = await db.select().from(usersTable);
  if (existingUsers.length === 0) {
    console.log("Creating seed users...");

    const [adminUser] = await db.insert(usersTable).values({
      fullName: "System Admin",
      email: "admin@barago.ph",
      passwordHash,
      role: "admin",
      status: "active",
    }).returning();

    console.log(`Created Admin: ${adminUser.email}`);

    const [workerUser] = await db.insert(usersTable).values({
      fullName: "Health Worker",
      email: "worker@barago.ph",
      passwordHash,
      role: "health_worker",
      status: "active",
    }).returning();

    console.log(`Created Health Worker: ${workerUser.email}`);

    const [juanUser] = await db.insert(usersTable).values({
      fullName: "Juan Dela Cruz",
      email: "juan@barago.ph",
      passwordHash,
      role: "resident",
      status: "active",
    }).returning();

    console.log(`Created Resident User: ${juanUser.email}`);

    await db.insert(residentsTable).values({
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

    console.log("Created Resident profile for Juan Dela Cruz");
  } else {
    console.log("Users already exist. Skipping user seed.");
  }

  const existingSchedules = await db.select().from(healthSchedulesTable);
  if (existingSchedules.length === 0) {
    const baseDate = new Date();
    const scheduleSeeds = [
      { dayOffset: 2, startTime: "08:00", endTime: "12:00", slotLimit: 20, assignedStaff: "worker@barago.ph" },
      { dayOffset: 3, startTime: "09:00", endTime: "13:00", slotLimit: 16, assignedStaff: "worker@barago.ph" },
      { dayOffset: 4, startTime: "13:00", endTime: "17:00", slotLimit: 18, assignedStaff: "worker@barago.ph" },
      { dayOffset: 5, startTime: "08:30", endTime: "12:30", slotLimit: 15, assignedStaff: "worker@barago.ph" },
      { dayOffset: 6, startTime: "10:00", endTime: "14:00", slotLimit: 12, assignedStaff: "worker@barago.ph" },
    ];

    await db.insert(healthSchedulesTable).values(
      scheduleSeeds.map((schedule) => ({
        scheduleDate: toDateString(addDays(baseDate, schedule.dayOffset)),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotLimit: schedule.slotLimit,
        currentSlots: 0,
        assignedStaff: schedule.assignedStaff,
        status: "open",
      }))
    );

    console.log("Created 5 seed health schedules.");
  } else {
    console.log("Schedules already exist. Skipping schedule seed.");
  }

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
