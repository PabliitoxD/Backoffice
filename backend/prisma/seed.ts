import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Limpeza de Dados (Reset Total) ---');
  
  // Limpeza em ordem para evitar erros de chave estrangeira
  await prisma.auditLog.deleteMany({});
  await prisma.chargebackDefense.deleteMany({});
  await prisma.receivable.deleteMany({});
  await prisma.transactionHistory.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.withdrawal.deleteMany({});
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
    { name: 'João Ricardo Silva', document: '12345678901', email: 'joao.silva@email.com' },
    { name: 'Maria Eduarda Santos', document: '23456789012', email: 'maria.santos@gmail.com' },
    { name: 'Carlos Augusto Ferreira', document: '34567890123', email: 'carlos.augusto@outlook.com' },
    { name: 'Ana Beatriz Souza', document: '45678901234', email: 'ana.souza@yahoo.com' },
    { name: 'Ricardo Alberto Lima', document: '56789012345', email: 'ricardo.lima@email.com' },
    { name: 'Fernanda Oliveira Costa', document: '67890123456', email: 'fernanda.costa@gmail.com' },
    { name: 'Juliana Paes Gomes', document: '78901234567', email: 'juliana.gomes@outlook.com' },
    { name: 'Lucas Gabriel Martins', document: '89012345678', email: 'lucas.martins@email.com' },
    { name: 'Camila Vitória Rocha', document: '90123456789', email: 'camila.rocha@gmail.com' },
    { name: 'Gabriel Henrique Silva', document: '01234567890', email: 'gabriel.silva@outlook.com' },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({ data: c });
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
  const today = new Date();
  
  for (let i = 0; i < 40; i++) {
    const status = i < 20 ? 'APPROVED' : statuses[i % statuses.length];
    const amount = 50.0 + (Math.random() * 500);
    const fee = amount * 0.05; // 5% de taxa da plataforma
    
    // Gante que pelo menos 5 vendas sejam de HOJE para o filtro padrão
    let date;
    if (i < 5) {
      date = today;
    } else {
      date = new Date(2026, 3, 1 + (i % 25)); // Abril 2026
    }
    
    const tx = await prisma.transaction.create({
      data: {
        producerId: createdProducers[i % createdProducers.length].id,
        customerId: createdCustomers[i % createdCustomers.length].id,
        productId: createdProducts[i % createdProducts.length].id,
        amount,
        fee,
        method: methods[i % methods.length],
        cardBrand: (i % methods.length === 0) ? brands[i % brands.length] : null,
        status,
        createdAt: date,
        approvedAt: (status === 'APPROVED' || status === 'COMPLETED') ? date : null,
        chargebackAt: status === 'CHARGEBACK' ? date : null,
        chargebackObservation: status === 'CHARGEBACK' ? 'Contestação de teste realizada pelo gateway.' : null
      }
    });

    // Criar Recebível para transações aprovadas/concluídas
    if (['APPROVED', 'COMPLETED'].includes(status)) {
       await prisma.receivable.create({
         data: {
           transactionId: tx.id,
           installment: 1,
           amount: amount - fee, // Valor líquido do produtor
           status: status === 'COMPLETED' ? 'AVAILABLE' : 'WAITING_FUNDS',
           expectedAt: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)
         }
       });
    }
  }

  // 6. Criar Saques (PENDING e COMPLETED)
  console.log('--- Criando Saques ---');
  for (let i = 0; i < 8; i++) {
    const status = i < 3 ? 'COMPLETED' : (i < 5 ? 'APPROVED' : 'PENDING');
    const amount = 300.00 + (Math.random() * 1000);
    const fee = 4.90;
    const date = i < 2 ? today : new Date(2026, 3, 10 + i);

    await prisma.withdrawal.create({
      data: {
        producerId: createdProducers[i % createdProducers.length].id,
        amount,
        fee,
        status,
        pixKey: createdProducers[i % createdProducers.length].pixKey,
        createdAt: date,
        approvedAt: status !== 'PENDING' ? date : null,
        completedAt: status === 'COMPLETED' ? date : null,
      }
    });
  }

  console.log('--- Seed Concluído com Sucesso ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
