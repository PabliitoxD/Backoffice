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

    const transactionWhere: any = { 
      ...whereClause,
      status: { in: ['APPROVED', 'COMPLETED', 'CHARGEBACK', 'REFUNDED', 'REVERSED', 'CLAIMED'] }
    };
    const withdrawalWhere: any = { 
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
      if (t.method === 'Cartão de Crédito' && (t as any).installments) {
        installments = `${(t as any).installments}x`;
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
    const currentStart = startDate ? new Date(startDate) : new Date();
    const currentEnd = endDate ? new Date(endDate) : new Date();

    if (startDate || endDate) {
      periodWhere.createdAt = {};
      if (startDate) periodWhere.createdAt.gte = currentStart;
      if (endDate) periodWhere.createdAt.lte = currentEnd;
    }

    // Calcular período anterior para comparativo
    const duration = currentEnd.getTime() - currentStart.getTime();
    const prevStart = new Date(currentStart.getTime() - duration - 1000);
    const prevEnd = new Date(currentEnd.getTime() - duration - 1000);
    const prevPeriodWhere = {
      createdAt: { gte: prevStart, lte: prevEnd }
    };

    const getStats = async (where: any) => {
      const tx = await this.prisma.transaction.aggregate({
        where: { ...where, status: { in: ['APPROVED', 'COMPLETED'] } },
        _sum: { amount: true, fee: true },
        _count: true,
      });
      const wd = await this.prisma.withdrawal.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { fee: true }
      });
      return {
        tpv: tx._sum.amount || 0,
        revenue: (tx._sum.fee || 0) + (wd._sum.fee || 0),
        count: tx._count || 0
      };
    };

    const currentStats = await getStats(periodWhere);
    const prevStats = await getStats(prevPeriodWhere);

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    // Chargebacks (Período Atual)
    const chargebackAgg = await this.prisma.transaction.aggregate({
      where: { ...periodWhere, status: 'CHARGEBACK' },
      _sum: { amount: true },
      _count: true
    });

    // Saques (Período Atual)
    const processedWithdrawalsAgg = await this.prisma.withdrawal.aggregate({
      where: { ...periodWhere, status: 'COMPLETED' },
      _sum: { amount: true },
      _count: true
    });

    // TOP 5 TPV
    const topTpvRaw = await this.prisma.transaction.groupBy({
      by: ['producerId'],
      where: { ...periodWhere, status: { in: ['APPROVED', 'COMPLETED'] } },
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
        return { name: producer?.name || 'Vendedor', value: item._sum.amount || 0 }
      })
    );

    // TOP 5 Saques
    const topWithdrawalsRaw = await this.prisma.withdrawal.groupBy({
      by: ['producerId'],
      where: { ...periodWhere, status: 'COMPLETED' },
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
        return { name: producer?.name || 'Vendedor', value: item._sum.amount || 0 }
      })
    );

    return {
      revenue: currentStats.revenue,
      revenueTrend: calcTrend(currentStats.revenue, prevStats.revenue),
      tpv: currentStats.tpv,
      tpvTrend: calcTrend(currentStats.tpv, prevStats.tpv),
      transactionsCount: currentStats.count,
      transactionsTrend: calcTrend(currentStats.count, prevStats.count),
      chargebackCount: chargebackAgg._count || 0,
      chargebackVolume: chargebackAgg._sum.amount || 0,
      withdrawalsCompletedVolume: processedWithdrawalsAgg._sum.amount || 0,
      withdrawalsCompletedCount: processedWithdrawalsAgg._count || 0,
      topTpv,
      topWithdrawals,
      totalCustomers: await this.prisma.customer.count(),
    };
  }
}
