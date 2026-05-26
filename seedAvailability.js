const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching doctors...');
  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR' }
  });

  if (doctors.length === 0) {
    console.log('No doctors found to add availability for.');
    return;
  }

  console.log(`Found ${doctors.length} doctors. Adding availability slots...`);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0); // 9:00 AM tomorrow

  for (const doc of doctors) {
    // Add 3 slots for each doctor tomorrow
    for (let i = 0; i < 3; i++) {
      const startTime = new Date(tomorrow);
      startTime.setHours(9 + i); // 9AM, 10AM, 11AM
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      await prisma.availability.create({
        data: {
          doctorId: doc.id,
          startTime: startTime,
          endTime: endTime,
          status: 'AVAILABLE'
        }
      });
    }
    console.log(`Added 3 availability slots for ${doc.name}`);
  }

  console.log('Availability seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
