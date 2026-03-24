import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@superfin.com.br';
  const password = '123456';
  
  console.log(`--- Iniciando Fix de Usuário: ${email} ---`);
  
  // 1. Gerar Hash Seguro
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('✔ Hash de senha gerado com sucesso.');

  // 2. Upsert no Banco de Dados
  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Administrador Principal'
    },
    create: {
      email,
      name: 'Administrador Principal',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`✔ Usuário ${user.email} ATUALIZADO/CRIADO com sucesso.`);
  console.log('--- Processo Finalizado ---');
}

main()
  .catch((e) => {
    console.error('✖ Erro ao executar o script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
