import dotenv from "dotenv";
import { PrismaClient, Role } from "@prisma/client";
import bcryptjs from "bcryptjs";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log("Seed skipped: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are not set.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("Seed admin already exists.");
    return;
  }

  const passwordHash = await bcryptjs.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      name: "Admin",
      location: "—",
      avatar: "AD",
      position: "Administrator",
      experience: "—",
      level: "—",
      joinDate: new Date().toISOString().slice(0, 10),
    },
  });

  console.log("Seed admin created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

