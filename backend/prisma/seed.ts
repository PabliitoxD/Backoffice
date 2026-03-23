import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@superfin.com.br' },
    update: {},
    create: {
      email: 'admin@superfin.com.br',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const producer = await prisma.producer.upsert({
    where: { document: '12345678900' },
    update: {},
    create: {
      name: 'Produtor Exemplo',
      document: '12345678900',
      email: 'produtor@exemplo.com',
      phone: '11999999999'
    }
  });

  const customer = await prisma.customer.upsert({
    where: { document: '09876543211' },
    update: {},
    create: {
      name: 'Cliente Exemplo',
      document: '09876543211',
      email: 'cliente@exemplo.com',
    }
  });

  const product = await prisma.product.upsert({
    where: { code: 'PROD-001' },
    update: {},
    create: {
      code: 'PROD-001',
      name: 'Produto Inicial',
      price: 150.00,
      producerId: producer.id,
    }
  });

  const transaction = await prisma.transaction.create({
    data: {
      producerId: producer.id,
      customerId: customer.id,
      productId: product.id,
      amount: 150.00,
      method: 'PIX',
      status: 'APPROVED',
      history: {
        create: [
          { status: 'WAITING', details: 'Aguardando pagamento' },
          { status: 'APPROVED', details: 'Pagamento aprovado via PIX' }
        ]
      }
    }
  });

  console.log('Seed executado com sucesso: User admin@superfin.com.br (senha: 123456) cadastrado. Exemplos de Produtor, Cliente, Produto e Transação criados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
