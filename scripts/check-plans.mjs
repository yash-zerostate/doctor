// One-off: print each user's plan + addOns to confirm billing saves work.
// Run:  node scripts/check-plans.mjs
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  select: { email: true, role: true, plan: true, addOns: true },
  orderBy: { email: "asc" },
});

for (const u of users) {
  console.log(
    `${u.email.padEnd(28)} role=${String(u.role).padEnd(10)} plan=${String(u.plan).padEnd(12)} addOns=${JSON.stringify(u.addOns)}`
  );
}
await prisma.$disconnect();
