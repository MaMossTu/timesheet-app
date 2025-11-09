import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create demo companies first (without user relation)
  const demoCompanies = [
    {
      id: "company1",
      name: "ABC Corporation",
      code: "ABC",
      description: "Technology Solutions Company",
      approvedBy: "John Smith (Manager)",
    },
    {
      id: "company2",
      name: "XYZ Enterprise",
      code: "XYZ",
      description: "Consulting Services",
      approvedBy: "Sarah Johnson (Director)",
    },
    {
      id: "company3",
      name: "StartupTech",
      code: "ST",
      description: "Software Development Startup",
      approvedBy: "Mike Chen (CEO)",
    },
  ];

  // Create demo users
  const user1 = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      id: "1",
      email: "demo@example.com",
      username: "demo",
      name: "Demo User",
      prefix: "Mr.",
      selectedCompanyId: "company1",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: "2",
      email: "admin@example.com",
      username: "admin",
      name: "Admin User",
      prefix: "Ms.",
      selectedCompanyId: "company1",
    },
  });

  // Create companies for users
  for (const companyData of demoCompanies) {
    await prisma.company.upsert({
      where: { id: companyData.id },
      update: {},
      create: {
        ...companyData,
        userId: user1.id, // Assign to first user
      },
    });

    // Also create for second user
    await prisma.company.upsert({
      where: { id: companyData.id + "_user2" },
      update: {},
      create: {
        ...companyData,
        id: companyData.id + "_user2",
        userId: user2.id,
      },
    });
  }

  console.log("✅ Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
