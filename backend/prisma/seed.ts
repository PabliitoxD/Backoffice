import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando limpeza seletiva (Preservando Usuários e Perfis) ---');
  
  // Limpeza de logs e dados transacionais
  await prisma.auditLog.deleteMany();
  await prisma.chargebackDefense.deleteMany();
  await prisma.transactionHistory.deleteMany();
  await prisma.receivable.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.producer.deleteMany();

  console.log('--- Criando Novos Exemplos ---');

  // Produtores
  const producer1 = await prisma.producer.create({
    data: {
      name: 'Super Player Games',
      document: '99888777000100',
      email: 'contato@superplayer.com',
      phone: '11977776666',
      pixKey: '99888777000100'
    }
  });

  const producer2 = await prisma.producer.create({
    data: {
      name: 'Educa Mais Online',
      document: '44555666000111',
      email: 'financeiro@educamais.com',
      pixKey: 'financeiro@educamais.com'
    }
  });

  // Clientes
  const customer1 = await prisma.customer.create({
    data: { name: 'Roberto Alencar', document: '22233344455', email: 'roberto@email.com' }
  });

  const customer2 = await prisma.customer.create({
    data: { name: 'Alice Fernandes', document: '88877766655', email: 'alice@email.com' }
  });

  // Produtos
  const product1 = await prisma.product.create({
    data: {
      code: 'GEM-500',
      name: 'Pacote 500 Gemas - Battle Arena',
      price: 49.90,
      producerId: producer1.id,
    }
  });

  const product2 = await prisma.product.create({
    data: {
      code: 'PLANO-MASTER',
      name: 'Assinatura Master Anual',
      price: 1200.00,
      producerId: producer2.id,
    }
  });

  console.log('--- Criando Transações e Chargebacks ---');
  const now = new Date();
  const someDaysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Vendas Normais
  await prisma.transaction.create({
    data: {
      producerId: producer1.id, customerId: customer1.id, productId: product1.id,
      amount: 49.90, method: 'PIX', status: 'COMPLETED', createdAt: someDaysAgo(5)
    }
  });

  // Chargeback Crítico (4 dias atrás - restando 1 dia para defesa)
  const txCritico = await prisma.transaction.create({
    data: {
      producerId: producer2.id, customerId: customer2.id, productId: product2.id,
      amount: 1200.00, method: 'Cartão de Crédito', cardBrand: 'MasterCard',
      status: 'CHARGEBACK', chargebackAt: someDaysAgo(4), createdAt: someDaysAgo(40),
      installments: 12,
      history: {
        create: [
          { status: 'APPROVED', details: 'Venda parcelada em 12x' },
          { status: 'CHARGEBACK', details: 'Disputa aberta pelo titular' }
        ]
      }
    }
  });

  // Chargeback Regular (1 dia atrás - restando 4 dias)
  await prisma.transaction.create({
    data: {
      producerId: producer1.id, customerId: customer2.id, productId: product1.id,
      amount: 49.90, method: 'Cartão de Crédito', cardBrand: 'Visa',
      status: 'CHARGEBACK', chargebackAt: someDaysAgo(1), createdAt: someDaysAgo(10),
      history: {
        create: { status: 'CHARGEBACK', details: 'Aguardando manifestação' }
      }
    }
  });

  console.log('--- Criando Saques (Apenas PENDENTES) ---');
  await prisma.withdrawal.create({
    data: {
      amount: 2500.00, fee: 5.00, status: 'PENDING', 
      producerId: producer1.id, pixKey: producer1.pixKey || ''
    }
  });

  await prisma.withdrawal.create({
    data: {
      amount: 150.00, fee: 5.00, status: 'PENDING', 
      producerId: producer2.id, pixKey: producer2.pixKey || ''
    }
  });

  console.log('--- Criando Recebíveis ---');
  for (let i = 1; i <= 6; i++) {
    await prisma.receivable.create({
      data: {
        transactionId: txCritico.id,
        installment: i,
        amount: 100.00,
        status: i === 1 ? 'AVAILABLE' : 'WAITING_FUNDS',
        expectedAt: new Date(now.getFullYear(), now.getMonth() + (i - 1), now.getDate())
      }
    });
  }

  console.log('--- Seed finalizado com sucesso (Usuários mantidos) ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
