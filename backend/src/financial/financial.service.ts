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

  async getDashboardSummary(startDate?: string, endDate?: string) {
    const periodWhere: any = {};
    if (startDate || endDate) {
      periodWhere.createdAt = {};
      if (startDate) periodWhere.createdAt.gte = new Date(startDate);
      if (endDate) periodWhere.createdAt.lte = new Date(endDate);
    }

    // TPV & Receita (Transactions)
    const txAgg = await this.prisma.transaction.aggregate({
      where: { 
        ...periodWhere,
        status: { in: ['APPROVED', 'COMPLETED'] } 
      },
      _sum: { amount: true, fee: true },
      _count: true,
    });

    // Receita (Withdrawals)
    const wdFeeAgg = await this.prisma.withdrawal.aggregate({
      where: {
        ...periodWhere,
        status: 'COMPLETED',
      },
      _sum: { fee: true }
    });

    // Chargebacks
    const chargebackAgg = await this.prisma.transaction.aggregate({
      where: {
        ...periodWhere,
        status: 'CHARGEBACK'
      },
      _sum: { amount: true },
      _count: true
    });

    // Total Transactions (Count)
    const totalTransactionsCount = await this.prisma.transaction.count({
      where: periodWhere
    });

    // Processed Withdrawals
    const processedWithdrawalsAgg = await this.prisma.withdrawal.aggregate({
      where: {
        ...periodWhere,
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      _count: true
    });

    // All-time metrics (optional context)
    const totalCustomersCount = await this.prisma.customer.count();

    // TOP 5 TPV
    const topTpvRaw = await this.prisma.transaction.groupBy({
      by: ['producerId'],
      where: {
        ...periodWhere,
        status: { in: ['APPROVED', 'COMPLETED'] }
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    });

    const topTpv = await Promise.all(
        topTpvRaw.map(async (item) => {
            const producer = await this.prisma.producer.findUnique({
                where: { id: item.producerId },
                select: { name: true }
            });
            return {
                name: producer?.name || 'Vendedor Desconhecido',
                value: item._sum.amount || 0
            }
        })
    );

    // TOP 5 Withdrawals (COMPLETED)
    const topWithdrawalsRaw = await this.prisma.withdrawal.groupBy({
      by: ['producerId'],
      where: {
        ...periodWhere,
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    });

    const topWithdrawals = await Promise.all(
        topWithdrawalsRaw.map(async (item) => {
            const producer = await this.prisma.producer.findUnique({
                where: { id: item.producerId },
                select: { name: true }
            });
            return {
                name: producer?.name || 'Vendedor Desconhecido',
                value: item._sum.amount || 0
            }
        })
    );

    return {
      revenue: (txAgg._sum.fee || 0) + (wdFeeAgg._sum.fee || 0),
      tpv: txAgg._sum.amount || 0,
      chargebackCount: chargebackAgg._count || 0,
      chargebackVolume: chargebackAgg._sum.amount || 0,
      transactionsCount: totalTransactionsCount,
      withdrawalsCompletedVolume: processedWithdrawalsAgg._sum.amount || 0,
      withdrawalsCompletedCount: processedWithdrawalsAgg._count || 0,
      topTpv,
      topWithdrawals,
      totalCustomers: totalCustomersCount,
    };
  }
}
