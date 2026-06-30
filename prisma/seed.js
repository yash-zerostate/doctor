// Seeds mock users (admin / doctors / patient) with bcrypt-hashed passwords,
// plus availability for the primary doctor so booking works out of the box.
// Run with:  npm run seed
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const USERS = [
  {
    email: "admin@medimeet.com",
    password: "Admin@123",
    name: "Alex Admin",
    role: "ADMIN",
    credits: 0,
  },
  {
    email: "patient@medimeet.com",
    password: "Patient@123",
    name: "Pat Patient",
    role: "PATIENT",
    credits: 10,
  },
  {
    email: "dr.smith@medimeet.com",
    password: "Doctor@123",
    name: "Dr. Sarah Smith",
    role: "DOCTOR",
    credits: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80",
    specialty: "Cardiology",
    experience: 12,
    description:
      "Experienced cardiologist specializing in heart disease and preventative care.",
    verificationStatus: "VERIFIED",
    withAvailability: true,
  },
  {
    email: "dr.chen@medimeet.com",
    password: "Doctor@123",
    name: "Dr. Michael Chen",
    role: "DOCTOR",
    credits: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
    specialty: "Dermatology",
    experience: 8,
    description:
      "Board-certified dermatologist focusing on skin health and cosmetic procedures.",
    verificationStatus: "VERIFIED",
  },
  {
    email: "dr.johnson@medimeet.com",
    password: "Doctor@123",
    name: "Dr. Emily Johnson",
    role: "DOCTOR",
    credits: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1594824436998-ef22abf2f65a?w=800&q=80",
    specialty: "Pediatrics",
    experience: 15,
    description:
      "Caring pediatrician dedicated to children's health from infancy through adolescence.",
    verificationStatus: "PENDING", // shows up in admin's "pending verification" queue
  },
];

async function main() {
  console.log("Seeding users...\n");

  for (const u of USERS) {
    const { password, withAvailability, ...rest } = u;
    const passwordHash = bcrypt.hashSync(password, 10);

    const data = { ...rest, email: rest.email.toLowerCase(), passwordHash };

    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });

    console.log(
      `  ✓ ${u.email}  (password: ${password}, role: ${u.role})`
    );

    if (withAvailability) {
      // Give the doctor a daily 9:00–17:00 availability window (idempotent).
      await prisma.availability.deleteMany({ where: { doctorId: user.id } });
      const start = new Date();
      start.setHours(9, 0, 0, 0);
      const end = new Date();
      end.setHours(17, 0, 0, 0);
      await prisma.availability.create({
        data: {
          doctorId: user.id,
          startTime: start,
          endTime: end,
          status: "AVAILABLE",
        },
      });
      console.log(`      + availability 09:00–17:00 added`);
    }
  }

  console.log(`\nSeeded ${USERS.length} users into the "doctor" database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
