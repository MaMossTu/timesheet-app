import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function viewDatabase() {
  console.log("🔍 ข้อมูลในฐานข้อมูล:");

  // ดู Users
  const users = await prisma.user.findMany({
    include: {
      companies: true,
      timeEntries: true,
    },
  });

  console.log("\n👥 Users:");
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.username})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Companies: ${user.companies.length}`);
    console.log(`   Time Entries: ${user.timeEntries.length}`);
    console.log(`   Selected Company: ${user.selectedCompanyId}\n`);
  });

  // ดู Companies
  const companies = await prisma.company.findMany({
    include: {
      user: true,
      timeEntries: true,
    },
  });

  console.log("🏢 Companies:");
  companies.forEach((company, index) => {
    console.log(`${index + 1}. ${company.name} (${company.code})`);
    console.log(`   Owner: ${company.user.name}`);
    console.log(`   Time Entries: ${company.timeEntries.length}`);
    console.log(`   Approved By: ${company.approvedBy}\n`);
  });

  // ดู Time Entries
  const timeEntries = await prisma.timeEntry.findMany({
    include: {
      user: true,
      company: true,
    },
  });

  console.log("⏰ Time Entries:");
  timeEntries.forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.title}`);
    console.log(`   User: ${entry.user.name}`);
    console.log(`   Company: ${entry.company.name}`);
    console.log(`   Date: ${entry.date}`);
    console.log(
      `   Time: ${entry.startTime} - ${entry.endTime || "ongoing"}\n`
    );
  });
}

viewDatabase()
  .catch((e) => {
    console.error("Error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
