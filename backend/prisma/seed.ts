import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Limpeza de Dados ---');
  
  // Limpeza em ordem para evitar erros de chave estrangeira
  await prisma.transactionHistory.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.withdrawal.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.producer.deleteMany({});

  console.log('--- Limpeza Concluída ---');

  // 1. Garantir Usuário Admin
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@superfin.com.br' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@superfin.com.br',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 2. Criar Produtores (5 exemplos)
  const producersData = [
    { name: 'Apex Digital Solutions', document: '11222333000199', email: 'contato@apexdigital.com', phone: '11988887777', pixKey: 'contato@apexdigital.com' },
    { name: 'Lumina Academy', document: '44555666000188', email: 'suporte@lumina.edu', phone: '21977776666', pixKey: '21977776666' },
    { name: 'Nexus Marketing Group', document: '77888999000177', email: 'adm@nexus.com.br', phone: '31966665555', pixKey: '77888999000177' },
    { name: 'Quantum Tech Lab', document: '12312312000100', email: 'labs@quantum.tech', phone: '11955554444', pixKey: 'labs@quantum.tech' },
    { name: 'Elite Design Studio', document: '32132132000111', email: 'hello@elitedesign.io', phone: '21944443333', pixKey: 'hello@elitedesign.io' },
  ];

  const createdProducers = [];
  for (const p of producersData) {
    const producer = await prisma.producer.create({ data: p });
    createdProducers.push(producer);
  }

  // 3. Criar Clientes (10 exemplos)
  const customersData = [
    { name: 'João Ricardo Silva', document: '123.456.789-01', email: 'joao.silva@email.com' },
    { name: 'Maria Eduarda Santos', document: '234.567.890-12', email: 'maria.santos@gmail.com' },
    { name: 'Carlos Augusto Ferreira', document: '345.678.901-23', email: 'carlos.augusto@outlook.com' },
    { name: 'Ana Beatriz Souza', document: '456.789.012-34', email: 'ana.souza@yahoo.com' },
    { name: 'Ricardo Alberto Lima', document: '567.890.123-45', email: 'ricardo.lima@email.com' },
    { name: 'Fernanda Oliveira Costa', document: '678.901.234-56', email: 'fernanda.costa@gmail.com' },
    { name: 'Juliana Paes Gomes', document: '789.012.345-67', email: 'juliana.gomes@outlook.com' },
    { name: 'Lucas Gabriel Martins', document: '890.123.456-78', email: 'lucas.martins@email.com' },
    { name: 'Camila Vitória Rocha', document: '901.234.567-89', email: 'camila.rocha@gmail.com' },
    { name: 'Gabriel Henrique Silva', document: '012.345.678-90', email: 'gabriel.silva@outlook.com' },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({ 
      data: {
        ...c,
        document: c.document.replace(/\D/g, '') // Remove formatação para o DB
      } 
    });
    createdCustomers.push(customer);
  }

  // 4. Criar Produtos (1 por produtor)
  const productsNames = ['Masterclass de IA', 'E-book: Escala de Negócios', 'Mentoria High Ticket', 'Kit de Design Premium', 'Curso de Marketing Digital'];
  const createdProducts = [];
  for (let i = 0; i < createdProducers.length; i++) {
    const product = await prisma.product.create({
      data: {
        code: `PROD-${100 + i}`,
        name: productsNames[i],
        price: 97.00 + (i * 150),
        producerId: createdProducers[i].id
      }
    });
    createdProducts.push(product);
  }

  // 5. Criar Transações (30 exemplos para o Dashboard)
  const methods = ['Cartão de Crédito', 'Pix', 'Boleto'];
  const brands = ['Visa', 'MasterCard', 'Elo'];
  const statuses = ['APPROVED', 'COMPLETED', 'CHARGEBACK', 'REFUNDED', 'WAITING'];
  
  console.log('--- Criando Transações de Teste (Abril/2026) ---');
  for (let i = 0; i < 30; i++) {
    const status = i < 15 ? 'APPROVED' : statuses[i % statuses.length];
    const amount = 50.0 + (Math.random() * 500);
    const date = new Date(2026, 3, 1 + (i % 16)); // Abril 1-16, 2026
    
    await prisma.transaction.create({
      data: {
        producerId: createdProducers[i % createdProducers.length].id,
        customerId: createdCustomers[i % createdCustomers.length].id,
        productId: createdProducts[i % createdProducts.length].id,
        amount,
        method: methods[i % methods.length],
        cardBrand: (i % methods.length === 0) ? brands[i % brands.length] : null,
        status,
        createdAt: date,
        approvedAt: (status === 'APPROVED' || status === 'COMPLETED') ? date : null,
        chargebackAt: status === 'CHARGEBACK' ? date : null,
        chargebackObservation: status === 'CHARGEBACK' ? 'Contestação de teste realizada pelo gateway.' : null
      }
    });
  }

  // 6. Criar Saques (PENDING, 5 exemplos)
  console.log('--- Criando Saques Pendentes ---');
  for (let i = 0; i < 5; i++) {
    await prisma.withdrawal.create({
      data: {
        producerId: createdProducers[i].id,
        amount: 500.00 + (i * 200),
        fee: 5.00,
        status: 'PENDING',
        pixKey: createdProducers[i].pixKey,
        createdAt: new Date(2026, 3, 14 + i) // Abril 14-18, 2026
      }
    });
  }

  console.log('--- Seed Concluído com Sucesso ---');
  console.log('Dica: Foram criados 5 produtores, 10 clientes e 30 transações focadas no mês de Abril/2026.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
