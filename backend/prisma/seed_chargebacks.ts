import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding chargebacks for March 2026...');

  const brands = ['Visa', 'MasterCard', 'Elo', 'Hipercard', 'Amex'];
  
  const producer = await prisma.producer.findFirst();
  const customer = await prisma.customer.findFirst();
  const product = await prisma.product.findFirst();
  
  if (producer && customer && product) {
      console.log('Using producer:', producer.name);
      
      for (let i = 0; i < 6; i++) {
          await prisma.transaction.create({
              data: {
                  amount: 250 + (i * 75),
                  method: 'Cartão de Crédito',
                  cardBrand: brands[i % brands.length],
                  status: 'CHARGEBACK',
                  producerId: producer.id,
                  customerId: customer.id,
                  productId: product.id,
                  createdAt: new Date(2026, 2, 5 + i), // March 5-10
                  chargebackAt: new Date(2026, 2, 20 + i), // March 20-25
                  chargebackObservation: i % 2 === 0 ? 'Exemplo de contestação no período atual.' : 'Aguardando defesa.'
              }
          });
      }
      console.log('Successfully created 6 chargebacks for March 2026.');
  } else {
    console.error('Seed error: No producer, customer or product found in DB.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
