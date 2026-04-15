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
          document: `112223330001${String(i).padStart(2, '0')}`,
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
          document: `111222333${String(i).padStart(2, '0')}`,
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

  console.log('--- Gerando Transações (Volume Realista) ---');
  const now = new Date();
  const getDate = (daysAgo: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const transactionEntries = [];
  // Status pool based on user's list
  const statusPool = [
    'APPROVED', 'COMPLETED', 'WAITING', 'EXIT-CHECKOUT', 
    'REFUSED', 'NOT_COMPLETED', 'REVERSED', 'CLAIMED', 'CHARGEBACK'
  ];
  const methods = ['PIX', 'Cartão de Crédito', 'Boleto'];

  for (let day = 0; day <= 30; day++) {
    // High volume for today (day 0) to ensure dashboard is populated
    const dailyCount = day === 0 ? 15 : 4;
    for (let i = 0; i < dailyCount; i++) {
      const prodIdx = Math.floor(Math.random() * producers.length);
      const custIdx = Math.floor(Math.random() * customers.length);
      const product = products[Math.floor(Math.random() * products.length)];
      
      const method = methods[i % 3];
      let status = statusPool[Math.floor(Math.random() * statusPool.length)];

      // Business Rule: CHARGEBACK, REFUSED, NOT_COMPLETED only for cards
      if (['CHARGEBACK', 'REFUSED', 'NOT_COMPLETED'].includes(status) && method !== 'Cartão de Crédito') {
        status = 'WAITING';
      }
      
      // Business Rule: WAITING only for PIX or Boleto
      if (status === 'WAITING' && method === 'Cartão de Crédito') {
        status = 'NOT_COMPLETED';
      }

      transactionEntries.push({
        producerId: producers[prodIdx].id,
        customerId: customers[custIdx].id,
        productId: product.id,
        amount: product.price,
        method,
        status,
        cardBrand: method === 'Cartão de Crédito' ? 'Mastercard' : null,
        condition: method === 'Cartão de Crédito' ? '12x' : null,
        createdAt: getDate(day, 8 + (i % 12)),
        approvedAt: ['COMPLETED', 'APPROVED'].includes(status) ? getDate(day, 9) : null,
        chargebackAt: status === 'CHARGEBACK' ? getDate(day, 14) : null,
        installments: method === 'Cartão de Crédito' ? 12 : 1
      });
    }
  }

  const createdTransactions = [];
  for (const entry of transactionEntries) {
    const tx = await prisma.transaction.create({ data: entry });
    createdTransactions.push(tx);
  }

  console.log('--- Gerando Recebíveis (Alinhado com as transações) ---');
  // Criar recebíveis para todas as transações APPROVED ou COMPLETED
  const paidTransactions = createdTransactions.filter(t => ['APPROVED', 'COMPLETED'].includes(t.status));
  for (const tx of paidTransactions) {
    await prisma.receivable.create({
      data: {
        transactionId: tx.id,
        installment: 1,
        amount: tx.amount * 0.90, // 10% de taxa padrão
        status: tx.status === 'COMPLETED' ? 'AVAILABLE' : 'WAITING_FUNDS',
        expectedAt: new Date(tx.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
      }
    });
  }

  console.log('--- Gerando Defesas de Chargeback (Apenas para cartões) ---');
  const cbTransactions = createdTransactions.filter(t => t.status === 'CHARGEBACK').slice(0, 10);
  for (const tx of cbTransactions) {
    await prisma.chargebackDefense.create({
      data: {
        transactionId: tx.id,
        description: 'Defesa automática gerada: Comprovante de acesso via IP e e-mail disponível.',
        status: i < 5 ? 'SENT' : 'PENDING',
        files: [
          { name: 'log_acesso.txt', url: 'https://example.com/log', type: 'text/plain', size: 1024 }
        ],
        submittedAt: tx.chargebackAt ? new Date(tx.chargebackAt.getTime() + 86400000) : new Date()
      }
    });
  }

  console.log('--- Gerando Histórico de Transações ---');
  const histTransactions = createdTransactions.slice(0, 20);
  for (const tx of histTransactions) {
    await prisma.transactionHistory.create({
      data: {
        transactionId: tx.id,
        status: tx.status,
        details: `Log de transação: Mudança de estado para ${tx.status}.`,
        createdAt: tx.createdAt
      }
    });
  }

  console.log('--- Gerando Saques (Todos PENDENTES) ---');
  for (let i = 0; i < 15; i++) {
    const prodIdx = i % producers.length;
    await prisma.withdrawal.create({
      data: {
        amount: 500 + (Math.random() * 1000),
        status: 'PENDING',
        producerId: producers[prodIdx].id,
        pixKey: producers[prodIdx].pixKey,
        createdAt: getDate(i % 5, 10)
      }
    });
  }

  console.log('--- Gerando Logs de Auditoria ---');
  const dashActions = ['LOGIN', 'VIEW_DASHBOARD', 'EXPORT_REPORT', 'UPDATE_SETTINGS', 'SEARCH_TRANSACTION'];
  for (let i = 0; i < 15; i++) {
    await prisma.auditLog.create({
      data: {
        action: dashActions[i % dashActions.length],
        entity: 'System',
        ip: '189.122.33.1',
        details: { info: `Ação de sistema efetuada` },
        createdAt: getDate(i % 3, 11)
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

