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

    // Busca todas as transações (ordenadas pelas mais recentes)
    const transactions = await this.prisma.transaction.findMany({
      where: transactionWhere,
      include: {
        producer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Busca todos os saques
    const withdrawals = await this.prisma.withdrawal.findMany({
      where: withdrawalWhere,
      include: {
        producer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Remapear transações para o formato unificado do extrato
    const mappedTransactions = transactions.map((t) => {
      // Impacto no Saldo: 
      // APPROVED/COMPLETED = Adiciona saldo (crédito)
      // CHARGEBACK/REFUNDED/REVERSED/CLAIMED = Retira saldo (débito)
      const isCredit = ['APPROVED', 'COMPLETED'].includes(t.status);
      const isDebit = ['CHARGEBACK', 'REFUNDED', 'REVERSED', 'CLAIMED'].includes(t.status);
      
      let impact = 0;
      if (isCredit) impact = t.amount;
      if (isDebit) impact = -t.amount;

      return {
        id: `tx-${t.id}`,
        type: 'TRANSACTION',
        description: `Venda (#${t.id.slice(0, 8)})`,
        producerName: t.producer.name,
        amount: t.amount,
        fee: 0, 
        impact, 
        status: t.status,
        date: t.createdAt,
      };
    });

    // Remapear saques para o formato unificado do extrato
    const mappedWithdrawals = withdrawals.map((w) => {
      // Apenas saques processados (COMPLETED) entram no extrato conforme regra de negócio
      const impact = -w.amount; // Deduz o valor total solicitado (valor líquido + tarifa)

      return {
        id: `wt-${w.id}`,
        type: 'WITHDRAWAL',
        description: `Saque Realizado`,
        producerName: w.producer.name,
        amount: w.amount,
        fee: w.fee, // Tarifa do saque
        impact,
        status: w.status,
        date: w.createdAt,
      };
    });

    // Unir tudo numa única timeline ordenada de forma decrescente
    const statement = [...mappedTransactions, ...mappedWithdrawals].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );

    return statement;
  }

  async getDashboardSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total Volume (All time and current month)
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

    // 2. Producers (Total active)
    const activeProducersCount = await this.prisma.producer.count({
      where: { status: 'ACTIVE' },
    });

    // 3. Customers (Total and new this month)
    const totalCustomersCount = await this.prisma.customer.count();
    const monthCustomersCount = await this.prisma.customer.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    // 4. Pending Withdrawals
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
