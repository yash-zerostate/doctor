const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock doctors...');

  const doctors = [
    {
      clerkUserId: 'mock_doctor_1_' + Date.now(),
      email: 'dr.smith2@example.com',
      name: 'Dr. Sarah Smith',
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
      role: 'DOCTOR',
      specialty: 'Cardiology',
      experience: 12,
      description: 'Experienced cardiologist specializing in heart disease and preventative care.',
      verificationStatus: 'VERIFIED',
    },
    {
      clerkUserId: 'mock_doctor_2_' + Date.now(),
      email: 'dr.chen2@example.com',
      name: 'Dr. Michael Chen',
      imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80',
      role: 'DOCTOR',
      specialty: 'Dermatology',
      experience: 8,
      description: 'Board-certified dermatologist focusing on skin health and cosmetic procedures.',
      verificationStatus: 'VERIFIED',
    },
    {
      clerkUserId: 'mock_doctor_3_' + Date.now(),
      email: 'dr.johnson2@example.com',
      name: 'Dr. Emily Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1594824436998-ef22abf2f65a?w=800&q=80',
      role: 'DOCTOR',
      specialty: 'Pediatrics',
      experience: 15,
      description: 'Caring pediatrician dedicated to children\'s health from infancy through adolescence.',
      verificationStatus: 'VERIFIED',
    }
  ];

  for (const doc of doctors) {
    await prisma.user.create({
      data: doc
    });
    console.log(`Created doctor: ${doc.name}`);
  }

  console.log('Seeding finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
