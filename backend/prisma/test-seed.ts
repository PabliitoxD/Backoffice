import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

async function test() {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  console.log('Filtro Hoje:', todayStart.toISOString(), 'até', todayEnd.toISOString());

  const count = await prisma.transaction.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  const statuses = await prisma.transaction.groupBy({
    by: ['status'],
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    _count: true
  });

  console.log('Total de transações hoje:', count);
  console.log('Por status:', JSON.stringify(statuses, null, 2));

  const allCount = await prisma.transaction.count();
  console.log('Total de transações no banco:', allCount);
}

test();
