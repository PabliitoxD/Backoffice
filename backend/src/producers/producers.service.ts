import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProducersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.producer.findMany({
      include: {
        _count: {
          select: { products: true, transactions: true }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.producer.findUnique({
      where: { id },
      include: {
        products: true,
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { customer: true, product: true }
        }
      }
    });
  }

  async getStatement(id: string) {
    const [transactions, withdrawals] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { producerId: id },
        orderBy: { createdAt: 'desc' },
        include: { customer: true, product: true }
      }),
      this.prisma.withdrawal.findMany({
        where: { producerId: id },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Format both into a unified statement list
    const statement = [
      ...transactions.map(t => ({
        id: t.id,
        type: 'TRANSACTION',
        amount: t.amount,
        status: t.status,
        description: `Venda: ${t.product?.name || 'Produto'}`,
        createdAt: t.createdAt,
        customerName: t.customer?.name
      })),
      ...withdrawals.map(w => ({
        id: w.id,
        type: 'WITHDRAWAL',
        amount: -w.amount, // Negative for statement
        status: w.status,
        description: 'Saque solicitado',
        createdAt: w.createdAt,
        customerName: null
      }))
    ];

    // Sort combined list by date desc
    return statement.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
