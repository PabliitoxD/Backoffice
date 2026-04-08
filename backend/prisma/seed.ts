import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando limpeza do banco de dados ---');
  
  // Ordem de limpeza para respeitar chaves estrangeiras
  await prisma.auditLog.deleteMany();
  await prisma.chargebackDefense.deleteMany();
  await prisma.transactionHistory.deleteMany();
  await prisma.receivable.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.producer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();

  console.log('--- Criando Perfil e Usuário Admin ---');
  const adminProfile = await prisma.profile.create({
    data: {
      name: 'Administrador Senior',
      permissions: [
        'dashboard:view', 'clients:manage', 'plans:manage', 
        'transactions:manage', 'users:manage', 'profiles:manage', 'settings:manage'
      ]
    }
  });

  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.create({
    data: {
      email: 'admin@superfin.com.br',
      name: 'Administrador do Sistema',
      password: hashedPassword,
      role: 'ADMIN',
      profileId: adminProfile.id
    },
  });

  console.log('--- Criando Produtores e Clientes ---');
  const producer = await prisma.producer.create({
    data: {
      name: 'Tech Inovação Ltda',
      document: '12345678000199',
      email: 'financeiro@techinovacao.com',
      phone: '11988887777',
      pixKey: 'financeiro@techinovacao.com'
    }
  });

  const customer1 = await prisma.customer.create({
    data: { name: 'João Carlos Pereira', document: '11122233344', email: 'joao@email.com' }
  });

  const customer2 = await prisma.customer.create({
    data: { name: 'Maria Eduarda Souza', document: '55566677788', email: 'maria@email.com' }
  });

  const product = await prisma.product.create({
    data: {
      code: 'CURSO-NEST-001',
      name: 'Curso Fullstack NestJS + Next.js',
      price: 497.00,
      producerId: producer.id,
    }
  });

  console.log('--- Criando Transações Variadas ---');
  const now = new Date();
  const someDaysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // 1. Transação Completa (COMPLETED)
  await prisma.transaction.create({
    data: {
      producerId: producer.id, customerId: customer1.id, productId: product.id,
      amount: 497.00, method: 'PIX', status: 'COMPLETED', approvedAt: someDaysAgo(10),
      createdAt: someDaysAgo(10)
    }
  });

  // 2. Transação com Chargeback Aberto (Recente - 2 dias atrás)
  const txChargeback = await prisma.transaction.create({
    data: {
      producerId: producer.id, customerId: customer2.id, productId: product.id,
      amount: 497.00, method: 'Cartão de Crédito', cardBrand: 'Visa',
      status: 'CHARGEBACK', chargebackAt: someDaysAgo(2), createdAt: someDaysAgo(30),
      history: {
        create: [
          { status: 'APPROVED', details: 'Aprovado pela adquirente' },
          { status: 'CHARGEBACK', details: 'Contestação recebida via API' }
        ]
      }
    }
  });

  // 3. Transação com Chargeback e Defesa já enviada
  const txDefended = await prisma.transaction.create({
    data: {
      producerId: producer.id, customerId: customer1.id, productId: product.id,
      amount: 1500.00, method: 'Cartão de Crédito', cardBrand: 'MasterCard',
      status: 'CHARGEBACK', chargebackAt: someDaysAgo(15), createdAt: someDaysAgo(45),
      history: {
        create: [
          { status: 'CHARGEBACK', details: 'Contestação registrada em Março' },
          { status: 'DEFENSE_SUBMITTED', details: 'Defesa enviada em 25/03/2026' }
        ]
      },
      chargebackDefenses: {
        create: {
          description: 'O cliente consumiu 100% do curso e participou das mentorias ao vivo. Seguem logs de acesso.',
          files: [{ name: 'contrato.pdf', size: 102400, type: 'application/pdf' }],
          status: 'SENT',
          acquirerRef: 'DEF-998877'
        }
      }
    }
  });

  // 4. Transação Aguardando Pagamento (WAITING)
  await prisma.transaction.create({
    data: {
      producerId: producer.id, customerId: customer2.id, productId: product.id,
      amount: 497.00, method: 'Boleto', status: 'WAITING', createdAt: someDaysAgo(1)
    }
  });

  console.log('--- Criando Saques ---');
  await prisma.withdrawal.create({
    data: {
      amount: 1200.00, fee: 5.00, status: 'APPROVED', 
      producerId: producer.id, pixKey: 'financeiro@techinovacao.com'
    }
  });

  await prisma.withdrawal.create({
    data: {
      amount: 50.00, fee: 5.00, status: 'PENDING', 
      producerId: producer.id, pixKey: 'financeiro@techinovacao.com'
    }
  });

  console.log('--- Criando Recebíveis Futuros ---');
  // Simulando parcelas para a transação 2 (que foi há 30 dias mas é cartão)
  for (let i = 1; i <= 3; i++) {
    await prisma.receivable.create({
      data: {
        transactionId: txChargeback.id,
        installment: i,
        amount: 150.00,
        status: i === 1 ? 'AVAILABLE' : 'WAITING_FUNDS',
        expectedAt: new Date(now.getFullYear(), now.getMonth() + (i - 1), now.getDate())
      }
    });
  }

  console.log('--- Seed finalizado com sucesso ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
