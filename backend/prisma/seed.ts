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

  console.log('--- Criando 10 Produtores e 15 Produtos ---');

  const producerNames = [
    'Super Player Games', 'Educa Mais Online', 'Fábrica de Apps', 'Designer Pro', 'Invest Master',
    'Tech Solutions', 'Artes Digitais', 'Marketing Ninja', 'Code Academy', 'Health & Mind'
  ];
  
  const producers = await Promise.all(
    producerNames.map((name, i) => 
      prisma.producer.create({
        data: {
          name,
          document: `112223330001${i}0`.slice(0, 14),
          email: `${name.toLowerCase().replace(/ /g, '.')}@email.com`,
          pixKey: `${name.toLowerCase().replace(/ /g, '.')}@pix.com`,
          status: 'ACTIVE'
        }
      })
    )
  );

  const products = await Promise.all(
    Array.from({ length: 15 }).map((_, i) => {
      const pIdx = i % producers.length;
      return prisma.product.create({
        data: {
          code: `PROD-${100 + i}`,
          name: `Produto Premium #${i + 1}`,
          price: 97 + (i * 47),
          producerId: producers[pIdx].id
        }
      });
    })
  );

  console.log('--- Criando 20 Clientes ---');
  const customers = await Promise.all(
    Array.from({ length: 20 }).map((_, i) => 
      prisma.customer.create({
        data: {
          name: `Cliente Teste ${i + 1}`,
          document: `1112223334${i}`.slice(0, 11),
          email: `cliente${i + 1}@email.com`,
          type: i % 5 === 0 ? 'Pessoa jurídica' : 'Pessoa física'
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
  const statusPool = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'WAITING', 'CHARGEBACK', 'CHARGEBACK'];

  for (let day = 0; day <= 30; day++) {
    const dailyCount = day === 0 ? 10 : 3;
    for (let i = 0; i < dailyCount; i++) {
      const prodIdx = Math.floor(Math.random() * producers.length);
      const custIdx = Math.floor(Math.random() * customers.length);
      const product = products[Math.floor(Math.random() * products.length)];
      const status = statusPool[Math.floor(Math.random() * statusPool.length)];
      const method = i % 3 === 0 ? 'CARTAO_CREDITO' : i % 3 === 1 ? 'PIX' : 'BOLETO';
      
      transactionEntries.push({
        producerId: producers[prodIdx].id,
        customerId: customers[custIdx].id,
        productId: product.id,
        amount: product.price,
        method,
        status,
        createdAt: getDate(day, 10 + i),
        approvedAt: status === 'COMPLETED' ? getDate(day, 11) : null,
        chargebackAt: status === 'CHARGEBACK' ? getDate(day, 14) : null,
        installments: method === 'CARTAO_CREDITO' ? (Math.random() > 0.5 ? 12 : 1) : 1
      });
    }
  }

  const createdTransactions = [];
  for (const entry of transactionEntries) {
    const tx = await prisma.transaction.create({ data: entry });
    createdTransactions.push(tx);
  }

  console.log('--- Gerando Recebíveis (5-10 exemplos) ---');
  const ccTransactions = createdTransactions.filter(t => t.method === 'CARTAO_CREDITO').slice(0, 10);
  for (const tx of ccTransactions) {
    await prisma.receivable.create({
      data: {
        transactionId: tx.id,
        installment: 1,
        amount: tx.amount * 0.95, // 5% fee
        status: tx.status === 'COMPLETED' ? 'AVAILABLE' : 'WAITING_FUNDS',
        expectedAt: new Date(tx.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
      }
    });
  }

  console.log('--- Gerando Defesas de Chargeback (5-10 exemplos) ---');
  const cbTransactions = createdTransactions.filter(t => t.status === 'CHARGEBACK').slice(0, 8);
  for (const tx of cbTransactions) {
    await prisma.chargebackDefense.create({
      data: {
        transactionId: tx.id,
        description: 'Defesa enviada com comprovante de entrega e logs de acesso.',
        status: Math.random() > 0.5 ? 'SENT' : 'PENDING',
        files: [
          { name: 'documento.pdf', url: 'https://example.com/doc', type: 'application/pdf', size: 1024 },
          { name: 'print.png', url: 'https://example.com/print', type: 'image/png', size: 512 }
        ],
        submittedAt: tx.chargebackAt ? new Date(tx.chargebackAt.getTime() + 86400000) : new Date()
      }
    });
  }

  console.log('--- Gerando Histórico de Transações (5-10 exemplos) ---');
  const histTransactions = createdTransactions.slice(0, 10);
  for (const tx of histTransactions) {
    await prisma.transactionHistory.create({
      data: {
        transactionId: tx.id,
        status: tx.status,
        details: 'Status atualizado via Gateway de Pagamento.',
        createdAt: tx.createdAt
      }
    });
  }

  console.log('--- Gerando Saques (10 exemplos) ---');
  for (let i = 0; i < 10; i++) {
    const prodIdx = i % producers.length;
    await prisma.withdrawal.create({
      data: {
        amount: 250 + (i * 100),
        status: i < 5 ? 'COMPLETED' : 'PENDING',
        producerId: producers[prodIdx].id,
        pixKey: producers[prodIdx].pixKey,
        createdAt: getDate(i + 1, 9)
      }
    });
  }

  console.log('--- Gerando Logs de Auditoria (10 exemplos) ---');
  const actions = ['LOGIN', 'UPDATE_PRODUCT', 'CREATE_WITHDRAWAL', 'UPDATE_PRODUCER', 'VIEW_REVENUE'];
  for (let i = 0; i < 10; i++) {
    await prisma.auditLog.create({
      data: {
        action: actions[i % actions.length],
        entity: i % 2 === 0 ? 'Transaction' : 'Producer',
        ip: '127.0.0.1',
        details: { message: `Simulação de ação ${i + 1}` },
        createdAt: getDate(i, 11)
      }
    });
  }

  console.log('--- Seed finalizado com sucesso! ---');
  console.log(`Resumo: ${producers.length} produtores, ${products.length} produtos, ${createdTransactions.length} transações.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

