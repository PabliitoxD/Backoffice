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

    // We fetch all records in the date range to calculate an accurate running balance
    // even if a search filter is applied later.
    const transactionWhereAll = { 
      ...whereClause,
      status: { in: ['APPROVED', 'COMPLETED', 'CHARGEBACK', 'REFUNDED', 'REVERSED', 'CLAIMED'] }
    };
    const withdrawalWhereAll = { 
      ...whereClause,
      status: { in: ['COMPLETED'] }
    };

    const transactions = await this.prisma.transaction.findMany({
      where: transactionWhereAll,
      include: {
        producer: { select: { name: true } },
        customer: true,
        product: true,
        history: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const withdrawals = await this.prisma.withdrawal.findMany({
      where: withdrawalWhereAll,
      include: {
        producer: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
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
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    let initialBalance = 0;
    if (startDate) {
      const start = new Date(startDate);
      
      const prevTransactions = await this.prisma.transaction.groupBy({
        by: ['status'],
        where: {
          createdAt: { lt: start },
          status: { in: ['APPROVED', 'COMPLETED', 'CHARGEBACK', 'REFUNDED', 'REVERSED', 'CLAIMED'] }
        },
        _sum: { amount: true }
      });

      const prevWithdrawals = await this.prisma.withdrawal.aggregate({
        where: {
          createdAt: { lt: start },
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      });

      for (const group of prevTransactions) {
        if (['APPROVED', 'COMPLETED'].includes(group.status)) {
          initialBalance += group._sum.amount || 0;
        } else {
          initialBalance -= group._sum.amount || 0;
        }
      }
      initialBalance -= prevWithdrawals._sum.amount || 0;
    }

    let currentBalance = initialBalance;
    const itemsWithBalance = combined.map((item) => {
      currentBalance += item.impact;
      return {
        ...item,
        runningBalance: currentBalance,
      };
    });
    
    // Now apply search filter in memory if provided
    let filteredItems = itemsWithBalance;
    if (search) {
      const s = search.toLowerCase();
      filteredItems = itemsWithBalance.filter(item => 
        item.originalId?.toLowerCase().includes(s) ||
        item.producerName.toLowerCase().includes(s) ||
        (item.customer?.name && item.customer.name.toLowerCase().includes(s)) ||
        (item.customer?.email && item.customer.email.toLowerCase().includes(s))
      );
    }

    const finalBalance = itemsWithBalance.length > 0 
      ? itemsWithBalance[itemsWithBalance.length - 1].runningBalance 
      : initialBalance;

    return {
      items: filteredItems.sort((a, b) => b.date.getTime() - a.date.getTime()),
      initialBalance,
      finalBalance
    };
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

  async getNotifications() {
    const notifications: any[] = [];
    const now = new Date();

    // 1. New Chargebacks (last 24h)
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newChargebacks = await this.prisma.transaction.findMany({
      where: {
        status: 'CHARGEBACK',
        createdAt: { gte: last24h }
      },
      select: { id: true, amount: true }
    });

    newChargebacks.forEach(cb => {
      notifications.push({
        id: `cb-${cb.id}`,
        type: 'CHARGEBACK',
        title: 'Novo Chargeback Recebido',
        message: `Venda #${cb.id.slice(0, 8)} de R$ ${cb.amount.toFixed(2)} sofreu chargeback.`,
        date: now,
        priority: 'HIGH'
      });
    });

    // 2. Chargeback Defense Deadlines
    // Assume 7 days from transaction createdAt for defense
    const threeDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days passed = 2 left
    const fourDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days passed = 1 left

    const approachingDeadlines = await this.prisma.transaction.findMany({
      where: {
        status: 'CHARGEBACK',
        createdAt: { lte: threeDaysAgo, gte: fourDaysAgo },
        chargebackDefenses: {
          none: { status: 'SENT' } // No defense sent yet
        }
      },
      select: { id: true, createdAt: true }
    });

    approachingDeadlines.forEach(cb => {
      const daysPassed = Math.floor((now.getTime() - cb.createdAt.getTime()) / (24 * 60 * 60 * 1000));
      const daysLeft = 7 - daysPassed;
      notifications.push({
        id: `dead-${cb.id}`,
        type: 'DEADLINE',
        title: 'Prazo de Defesa Expirando',
        message: `Faltam ${daysLeft} dia(s) para a defesa do chargeback #${cb.id.slice(0, 8)}.`,
        date: now,
        priority: 'CRITICAL'
      });
    });

    // 3. New Withdrawals (PENDING)
    const pendingWithdrawals = await this.prisma.withdrawal.findMany({
      where: { status: 'PENDING' },
      select: { id: true, amount: true }
    });

    pendingWithdrawals.forEach(wd => {
      notifications.push({
        id: `wd-${wd.id}`,
        type: 'WITHDRAWAL',
        title: 'Novo Pedido de Saque',
        message: `Saque solicitado no valor de R$ ${wd.amount.toFixed(2)}.`,
        date: now,
        priority: 'MEDIUM'
      });
    });

    return notifications.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
