import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding validation data for testing (Withdrawals and Chargebacks)...');

  // 1. Get references
  const producer = await prisma.producer.findFirst();
  const customer = await prisma.customer.findFirst();
  const product = await prisma.product.findFirst();

  if (!producer || !customer || !product) {
    console.error('Validation Seed error: No producer, customer or product found in DB. Run the main seed first.');
    return;
  }

  // 2. Clear current test data to avoid overlap (Optional: choose based on user preference, but here we add it)
  // await prisma.withdrawal.deleteMany({ where: { observation: 'TEST_VALIDATION' } });
  // await prisma.transaction.deleteMany({ where: { chargebackObservation: { contains: 'VALIDATION_TEST' } } });

  // 3. Create diverse Withdrawals
  const withdrawalData = [
    {
      amount: 1500.00,
      fee: 4.85,
      status: 'PENDING',
      pixKey: 'pix-pendente@validacao.com',
      observation: 'TEST_VALIDATION: Saque pendente para teste',
      createdAt: new Date(2026, 3, 1, 10, 0, 0), // April 1st
    },
    {
      amount: 2350.50,
      fee: 4.85,
      status: 'APPROVED',
      pixKey: 'pix-aprovado@validacao.com',
      observation: 'TEST_VALIDATION: Saque aprovado aguardando processamento',
      createdAt: new Date(2026, 3, 1, 11, 30, 0),
    },
    {
      amount: 500.00,
      fee: 4.85,
      status: 'COMPLETED',
      pixKey: 'pix-concluido@validacao.com',
      observation: 'TEST_VALIDATION: Saque já pago com sucesso',
      createdAt: new Date(2026, 2, 28, 15, 0, 0), // March 28th
    },
    {
      amount: 320.00,
      fee: 4.85,
      status: 'REFUSED',
      pixKey: 'pix-recusado@validacao.com',
      observation: 'TEST_VALIDATION: Saque recusado por chave inválida',
      createdAt: new Date(2026, 2, 25, 0, 0, 0),
    }
  ];

  for (const w of withdrawalData) {
    await prisma.withdrawal.create({
      data: {
        ...w,
        producerId: producer.id,
      }
    });
  }
  console.log('Successfully created 4 diverse withdrawals.');

  // 4. Create diverse Chargebacks
  const brands = ['Visa', 'MasterCard', 'Elo', 'Hipercard', 'Amex'];
  const chargebackData = [
    {
      amount: 450.00,
      method: 'Cartão de Crédito',
      status: 'CHARGEBACK',
      cardBrand: 'Visa',
      createdAt: new Date(2026, 3, 1), // April 1st
      chargebackAt: new Date(2026, 3, 1),
      chargebackObservation: 'VALIDATION_TEST: Chargeback recente (hoje)',
    },
    {
      amount: 125.75,
      method: 'Cartão de Crédito',
      status: 'CHARGEBACK',
      cardBrand: 'MasterCard',
      createdAt: new Date(2026, 2, 15), // March 15th
      chargebackAt: new Date(2026, 2, 29), // March 29th
      chargebackObservation: 'VALIDATION_TEST: Chargeback do mês passado final',
    },
    {
      amount: 890.00,
      method: 'Cartão de Crédito',
      status: 'CHARGEBACK',
      cardBrand: 'Elo',
      createdAt: new Date(2026, 2, 10),
      chargebackAt: new Date(2026, 2, 20),
      chargebackObservation: 'VALIDATION_TEST: Aguardando defesa bancária',
    }
  ];

  for (const c of chargebackData) {
    await prisma.transaction.create({
      data: {
        ...c,
        producerId: producer.id,
        customerId: customer.id,
        productId: product.id,
      }
    });
  }
  console.log('Successfully created 3 diverse chargebacks.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
