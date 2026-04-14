import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando limpeza seletiva (Preservando Usuários e Perfis) ---');
  
  console.log('Limpando AuditLog...'); await prisma.auditLog.deleteMany();
  console.log('Limpando ChargebackDefense...'); await prisma.chargebackDefense.deleteMany();
  console.log('Limpando TransactionHistory...'); await prisma.transactionHistory.deleteMany();
  console.log('Limpando Receivable...'); await prisma.receivable.deleteMany();
  console.log('Limpando Transaction...'); await prisma.transaction.deleteMany();
  console.log('Limpando Withdrawal...'); await prisma.withdrawal.deleteMany();
  console.log('Limpando Product...'); await prisma.product.deleteMany();
  console.log('Limpando Customer...'); await prisma.customer.deleteMany();
  console.log('Limpando Producer...'); await prisma.producer.deleteMany();

  console.log('--- Criando Produtores e Produtos ---');

  const producerNames = ['Super Player Games', 'Educa Mais Online', 'Fábrica de Apps', 'Designer Pro', 'Invest Master'];
  const producers = await Promise.all(
    producerNames.map((name, i) => 
      prisma.producer.create({
        data: {
          name,
          document: `112223330001${i}0`,
          email: `${name.toLowerCase().replace(/ /g, '.')}@email.com`,
          pixKey: `${name.toLowerCase().replace(/ /g, '.')}@pix.com`
        }
      })
    )
  );

  const products = await Promise.all(
    producers.map((p, i) => 
      prisma.product.create({
        data: {
          code: `PROD-${i}${i}${i}`,
          name: `Produto Especial ${p.name}`,
          price: 50 + (i * 150),
          producerId: p.id
        }
      })
    )
  );

  const customers = await Promise.all(
    Array.from({ length: 20 }).map((_, i) => 
      prisma.customer.create({
        data: {
          name: `Cliente Teste ${i + 1}`,
          document: `1112223334${i}`,
          email: `cliente${i + 1}@email.com`
        }
      })
    )
  );

  console.log('--- Gerando Transações (Volume Realista) ---');
  const now = new Date();
  
  const getDate = (daysAgo: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const transactionEntries = [];

  for (let day = 0; day <= 30; day++) {
    const transactionCount = day === 0 ? 15 : day === 1 ? 10 : Math.floor(Math.random() * 8) + 2;

    for (let i = 0; i < transactionCount; i++) {
      const prodIdx = Math.floor(Math.random() * producers.length);
      const custIdx = Math.floor(Math.random() * customers.length);
      const product = products[prodIdx];
      const method = i % 3 === 0 ? 'PIX' : i % 3 === 1 ? 'CARTAO_CREDITO' : 'BOLETO';
      
      const isChargeback = day > 2 && Math.random() > 0.95;
      const status = isChargeback ? 'CHARGEBACK' : 'COMPLETED';

      transactionEntries.push({
        producerId: producers[prodIdx].id,
        customerId: customers[custIdx].id,
        productId: product.id,
        amount: product.price,
        method,
        status,
        createdAt: getDate(day, 10 + (i % 8)),
        approvedAt: status === 'COMPLETED' ? getDate(day, 11) : null,
        chargebackAt: isChargeback ? getDate(day - 1, 14) : null,
        installments: method === 'CARTAO_CREDITO' ? (Math.random() > 0.5 ? 12 : 1) : 1
      });
    }
  }

  await Promise.all(transactionEntries.map(tx => prisma.transaction.create({ data: tx })));

  console.log('--- Gerando Saques ---');
  for (let i = 0; i < 10; i++) {
    const prodIdx = Math.floor(Math.random() * producers.length);
    const status = i < 7 ? 'PROCESSADO' : 'PENDENTE';
    
    await prisma.withdrawal.create({
      data: {
        amount: 500 + (Math.random() * 2000),
        fee: 5.00,
        status,
        producerId: producers[prodIdx].id,
        pixKey: producers[prodIdx].pixKey,
        createdAt: getDate(i, 9),
        updatedAt: getDate(i, 15)
      }
    });
  }

  for (let i = 0; i < 5; i++) {
    await prisma.transaction.create({
      data: {
        producerId: producers[0].id,
        customerId: customers[0].id,
        productId: products[0].id,
        amount: 5000,
        method: 'PIX',
        status: 'COMPLETED',
        createdAt: getDate(1, 10)
      }
    });
  }

  console.log('--- Seed finalizado com sucesso! ---');
  console.log(`Resumo: ${producers.length} produtores, ${transactionEntries.length} transações geradas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
