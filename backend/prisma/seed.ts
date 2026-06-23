import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Limpeza de Dados (Reset Total) ---');
  
  await prisma.auditLog.deleteMany({});
  await prisma.chargebackDefense.deleteMany({});
  await prisma.receivable.deleteMany({});
  await prisma.transactionHistory.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.withdrawal.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.producer.deleteMany({});
  await prisma.user.deleteMany({ where: { NOT: { email: 'admin@superfin.com.br' } } });

  console.log('--- Limpeza Concluída ---');

  // 1. Usuário Admin
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@superfin.com.br' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@superfin.com.br',
      name: 'Administrador Principal',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 2. Produtores (15 exemplos)
  console.log('--- Criando Produtores ---');
  const producersNames = [
    'Apex Digital', 'Lumina Academy', 'Nexus Marketing', 'Quantum Tech', 'Elite Design',
    'Infinity Soft', 'Titan Academy', 'Vanguard Solutions', 'Pulse Creative', 'Stellar Education',
    'Velocity Apps', 'Aura Wellness', 'Nova Systems', 'Orion Consultancy', 'Zenith Training'
  ];

  const createdProducers = [];
  for (let i = 0; i < producersNames.length; i++) {
    const producer = await prisma.producer.create({
      data: {
        name: producersNames[i],
        document: `112223330001${i.toString().padStart(2, '0')}`,
        email: `contato@${producersNames[i].toLowerCase().replace(' ', '')}.com`,
        phone: `119${Math.floor(80000000 + Math.random() * 10000000)}`,
        pixKey: `contato@${producersNames[i].toLowerCase().replace(' ', '')}.com`,
        status: 'ACTIVE'
      }
    });
    createdProducers.push(producer);
  }

  // 3. Clientes (20 exemplos)
  console.log('--- Criando Clientes ---');
  const firstNames = ['João', 'Maria', 'Carlos', 'Ana', 'Ricardo', 'Fernanda', 'Juliana', 'Lucas', 'Camila', 'Gabriel'];
  const lastNames = ['Silva', 'Santos', 'Ferreira', 'Souza', 'Lima', 'Oliveira', 'Costa', 'Gomes', 'Martins', 'Rocha'];
  
  const createdCustomers = [];
  for (let i = 0; i < 20; i++) {
    const name = `${firstNames[i % 10]} ${lastNames[(i + 3) % 10]}`;
    const customer = await prisma.customer.create({
      data: {
        name,
        document: `${Math.floor(10000000000 + Math.random() * 89999999999)}`,
        email: `${name.toLowerCase().replace(' ', '.')}@exemplo.com`,
      }
    });
    createdCustomers.push(customer);
  }

  // 4. Produtos (15 exemplos)
  console.log('--- Criando Produtos ---');
  const productTemplates = ['Masterclass', 'E-book', 'Mentoria', 'Kit Premium', 'Curso Online'];
  const createdProducts = [];
  for (let i = 0; i < 15; i++) {
    const product = await prisma.product.create({
      data: {
        code: `PROD-${200 + i}`,
        name: `${productTemplates[i % 5]} ${producersNames[i % producersNames.length]}`,
        price: 97.00 + (Math.random() * 1000),
        producerId: createdProducers[i % createdProducers.length].id
      }
    });
    createdProducts.push(product);
  }

  // 5. Transações (~60 exemplos)
  console.log('--- Criando Transações ---');
  const methods = ['Cartão de Crédito', 'Pix', 'Boleto'];
  const brands = ['Visa', 'MasterCard', 'Elo'];
  const statuses = ['APPROVED', 'COMPLETED', 'CHARGEBACK', 'REFUNDED', 'WAITING'];
  const today = new Date();

  for (let i = 0; i < 60; i++) {
    const status = i < 35 ? 'APPROVED' : (i < 40 ? 'CHARGEBACK' : statuses[i % statuses.length]);
    const amount = createdProducts[i % createdProducts.length].price;
    const fee = amount * 0.05;
    
    let date;
    if (i < 10) {
      date = today;
    } else {
      date = new Date();
      date.setDate(today.getDate() - (i % 20));
    }

    const tx = await prisma.transaction.create({
      data: {
        producerId: createdProducts[i % createdProducts.length].producerId,
        customerId: createdCustomers[i % createdCustomers.length].id,
        productId: createdProducts[i % createdProducts.length].id,
        amount,
        fee,
        method: methods[i % methods.length],
        cardBrand: (i % methods.length === 0) ? brands[i % brands.length] : null,
        status,
        createdAt: date,
        approvedAt: (['APPROVED', 'COMPLETED', 'CHARGEBACK'].includes(status)) ? date : null,
        chargebackAt: status === 'CHARGEBACK' ? date : null,
        chargebackObservation: status === 'CHARGEBACK' ? 'Contestação automática.' : null
      }
    });

    // Recebíveis
    if (['APPROVED', 'COMPLETED'].includes(status)) {
       await prisma.receivable.create({
         data: {
           transactionId: tx.id,
           installment: 1,
           amount: amount - fee,
           status: status === 'COMPLETED' ? 'AVAILABLE' : 'WAITING_FUNDS',
           expectedAt: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)
         }
       });
    }

    // Chargeback Defense for chargebacks
    if (status === 'CHARGEBACK' && i % 2 === 0) {
      await prisma.chargebackDefense.create({
        data: {
          transactionId: tx.id,
          description: 'Documentação de entrega enviada.',
          status: 'SENT',
          files: [{ name: 'comprovante.pdf', url: 'https://example.com/file.pdf', type: 'application/pdf', size: 1024 }],
          submittedAt: date
        }
      });
    }

    // Transaction History
    await prisma.transactionHistory.create({
        data: {
            transactionId: tx.id,
            status: 'WAITING',
            details: 'Iniciado pelo checkout',
            createdAt: date
        }
    });
    if (status !== 'WAITING') {
        await prisma.transactionHistory.create({
            data: {
                transactionId: tx.id,
                status,
                details: 'Status atualizado via gateway',
                createdAt: date
            }
        });
    }
  }

  // 6. Saques (15 exemplos)
  console.log('--- Criando Saques ---');
  for (let i = 0; i < 15; i++) {
    const status = i < 5 ? 'COMPLETED' : (i < 10 ? 'APPROVED' : (i < 13 ? 'PENDING' : 'REFUSED'));
    const amount = 200.00 + (Math.random() * 1500);
    const fee = 4.90;
    const date = new Date();
    date.setDate(today.getDate() - (i % 10));

    await prisma.withdrawal.create({
      data: {
        producerId: createdProducers[i % createdProducers.length].id,
        amount,
        fee,
        status,
        pixKey: createdProducers[i % createdProducers.length].pixKey,
        createdAt: date,
        approvedAt: status !== 'PENDING' && status !== 'REFUSED' ? date : null,
        completedAt: status === 'COMPLETED' ? date : null,
        observation: status === 'REFUSED' ? 'Chave PIX inválida.' : null
      }
    });
  }

  // 7. Auditoria (10 exemplos)
  console.log('--- Criando Auditoria ---');
  for (let i = 0; i < 10; i++) {
      await prisma.auditLog.create({
          data: {
              action: i % 2 === 0 ? 'LOGIN' : 'UPDATE_SETTING',
              entity: 'User',
              details: { ip: '192.168.0.1', agent: 'Mozilla/5.0' },
              createdAt: new Date()
          }
      });
  }

  console.log('--- Seed Concluído! 15 Produtores, 20 Clientes, 15 Produtos, 60 Transações e 15 Saques criados. ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
