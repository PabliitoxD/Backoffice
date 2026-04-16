import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async getGlobalStatement(startDate?: string, endDate?: string, search?: string) {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereClause.createdAt = { gte: new Date(startDate) };
    } else if (endDate) {
      whereClause.createdAt = { lte: new Date(endDate) };
    }

    const transactionWhere = { 
      ...whereClause,
      status: { in: ['APPROVED', 'COMPLETED', 'CHARGEBACK', 'REFUNDED', 'REVERSED', 'CLAIMED'] }
    };
    const withdrawalWhere = { 
      ...whereClause,
      status: { in: ['COMPLETED'] }
    };

    if (search) {
      transactionWhere.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { producer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { name: { contains: search, mode: 'insensitive' } } }
      ];
      withdrawalWhere.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { producer: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const transactions = await this.prisma.transaction.findMany({
      where: transactionWhere,
      include: {
        producer: { select: { name: true } },
        customer: true,
        product: true,
        history: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const withdrawals = await this.prisma.withdrawal.findMany({
      where: withdrawalWhere,
      include: {
        producer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedTransactions = transactions.map((t) => {
      const isCredit = ['APPROVED', 'COMPLETED'].includes(t.status);
      const isDebit = ['CHARGEBACK', 'REFUNDED', 'REVERSED', 'CLAIMED'].includes(t.status);
      
      let impact = 0;
      if (isCredit) impact = t.amount;
      if (isDebit) impact = -t.amount;

      let installments = '';
      if (t.method === 'Cartão de Crédito' && t.installments) {
        installments = `${t.installments}x`;
      }

      return {
        id: `tx-${t.id}`,
        originalId: t.id,
        type: 'TRANSACTION',
        description: `Venda (#${t.id.slice(0, 8)})`,
        producerName: t.producer.name,
        amount: t.amount,
        fee: 0, 
        impact, 
        status: t.status,
        date: t.createdAt,
        method: t.method || '',
        installments,
        cardBrand: t.cardBrand || '',
        customer: t.customer,
        product: t.product,
        history: t.history,
      };
    });

    const mappedWithdrawals = withdrawals.map((w) => {
      const impact = -w.amount;

      return {
        id: `wt-${w.id}`,
        type: 'WITHDRAWAL',
        description: `Saque Realizado`,
        producerName: w.producer.name,
        amount: w.amount,
        fee: w.fee,
        impact,
        status: w.status,
        date: w.createdAt,
        method: 'TRANSFER',
        installments: '',
        cardBrand: '',
      };
    });

    const combined = [...mappedTransactions, ...mappedWithdrawals].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );

    let currentBalance = 0;
    // Note: To have a true running balance, you'd need the initial balance before the filter period.
    // For now, we return the items as a list.
    
    return combined;
  }

  async getDashboardSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalVolumeAgg = await this.prisma.transaction.aggregate({
      where: { status: { in: ['APPROVED', 'COMPLETED'] } },
      _sum: { amount: true },
    });

    const monthVolumeAgg = await this.prisma.transaction.aggregate({
      where: {
        status: { in: ['APPROVED', 'COMPLETED'] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    });

    const activeProducersCount = await this.prisma.producer.count({
      where: { status: 'ACTIVE' },
    });

    const totalCustomersCount = await this.prisma.customer.count();
    const monthCustomersCount = await this.prisma.customer.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const pendingWithdrawalsAgg = await this.prisma.withdrawal.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
      _count: true,
    });

    return {
      totalVolume: totalVolumeAgg._sum.amount || 0,
      monthVolume: monthVolumeAgg._sum.amount || 0,
      activeProducers: activeProducersCount || 0,
      totalCustomers: totalCustomersCount || 0,
      monthCustomers: monthCustomersCount || 0,
      pendingWithdrawalsVolume: pendingWithdrawalsAgg._sum.amount || 0,
      pendingWithdrawalsCount: pendingWithdrawalsAgg._count || 0,
    };
  }
}
