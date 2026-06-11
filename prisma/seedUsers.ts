import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  {
    id: "user-admin",
    email: "admin@luxx.uz",
    name: "Akbar Nazarov",
    password: "Admin12345",
    role: Role.ADMIN,
  },
  {
    id: "user-manager",
    email: "manager@luxx.uz",
    name: "Shakhnoza Karimova (Manager)",
    password: "Manager12345",
    role: Role.MANAGER,
  },
  {
    id: "user-sales",
    email: "sales@luxx.uz",
    name: "Timur Alimov (Sales)",
    password: "Sales12345",
    role: Role.SALES,
  },
  {
    id: "user-warehouse",
    email: "warehouse@luxx.uz",
    name: "Jasur Nematov (Warehouse)",
    password: "Warehouse12345",
    role: Role.WAREHOUSE,
  },
  {
    id: "user-viewer",
    email: "viewer@luxx.uz",
    name: "Dilnoza Rustamova (Viewer)",
    password: "Viewer12345",
    role: Role.VIEWER,
  },
];

async function main() {
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
      },
    });
  }

  console.log(`Seeded ${users.length} role users without deleting existing data.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed role users:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
