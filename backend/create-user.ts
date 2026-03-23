import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'pablo.werner@superfin.com.br' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      email: 'pablo.werner@superfin.com.br',
      name: 'Pablo Werner',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`Usuário ${user.email} criado com sucesso no banco de dados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
