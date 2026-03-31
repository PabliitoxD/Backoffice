import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock pending withdrawals...');

  // Get first available producer to tie withdrawals to
  const producer = await prisma.producer.findFirst();
  if (!producer) {
    console.log('No producer found to tie withdrawals to. Exiting.');
    return;
  }

  // Create 5 fake withdrawals
  const data = Array.from({ length: 5 }).map((_, i) => ({
    amount: (i + 1) * 250.0 + 100, // 350, 600, 850, 1100, 1350
    fee: 5.0,
    status: 'PENDING',
    producerId: producer.id,
    pixKey: `fake-pix-${i}@email.com`,
  }));

  for (const d of data) {
    await prisma.withdrawal.create({ data: d });
  }

  console.log('Successfully created 5 PENDING withdrawals for producer:', producer.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
