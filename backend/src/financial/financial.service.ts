import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async getGlobalStatement(startDate?: string, endDate?: string, search?: string) {
    const whereClause: any = {};
    const beforeDateClause: any = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
      beforeDateClause.createdAt = { lt: new Date(startDate) };
    } else if (startDate) {
      whereClause.createdAt = { gte: new Date(startDate) };
      beforeDateClause.createdAt = { lt: new Date(startDate) };
    } else if (endDate) {
      whereClause.createdAt = { lte: new Date(endDate) };
    }

    // Calcula o saldo inicial (antes da data de início) se houver filtro de data
    let initialBalance = 0;
    if (startDate) {
      const pastTransactions = await this.prisma.transaction.findMany({
        where: beforeDateClause,
        select: { amount: true, status: true }
      });
      const pastWithdrawals = await this.prisma.withdrawal.findMany({
        where: beforeDateClause,
        select: { amount: true, status: true }
      });

      for (const t of pastTransactions) {
        if (['WAITING', 'APPROVED', 'COMPLETED'].includes(t.status)) initialBalance += t.amount;
        if (['CHARGEBACK', 'REFUNDED', 'REVERSED', 'CLAIMED'].includes(t.status)) initialBalance -= t.amount;
      }
      for (const w of pastWithdrawals) {
        if (['APPROVED', 'COMPLETED', 'PENDING'].includes(w.status)) initialBalance -= w.amount;
      }
    }

    const transactionWhere: any = { ...whereClause };
    const withdrawalWhere: any = { ...whereClause };

    transactionWhere.status = {
<<<<<<< HEAD
      in: ['APPROVED', 'REFUNDED', 'REVERSED', 'CHARGEBACK', 'COMPLETED', 'WAITING']
=======
      in: ['APPROVED', 'REFUNDED', 'REVERSED', 'CHARGEBACK']
>>>>>>> Feature/0006/financial
    };
    withdrawalWhere.status = {
      in: ['APPROVED', 'COMPLETED', 'PENDING']
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
      orderBy: { createdAt: 'asc' }, // Ordena ASC primeiro para cálculo do saldo
    });

    const withdrawals = await this.prisma.withdrawal.findMany({
      where: withdrawalWhere,
      include: {
        producer: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const mappedTransactions = transactions.map((t) => {
      const isCredit = ['WAITING', 'APPROVED', 'COMPLETED'].includes(t.status);
      const isDebit = ['CHARGEBACK', 'REFUNDED', 'REVERSED', 'CLAIMED'].includes(t.status);
      
      let impact = 0;
      if (isCredit) impact = t.amount;
      if (isDebit) impact = -t.amount;

      // Extract installments if Credit Card (e.g., from 'condition')
      let installments = '';
      if (t.method === 'Cartão de Crédito' && t.condition) {
         installments = t.condition;
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
      const isDebit = ['APPROVED', 'COMPLETED', 'PENDING'].includes(w.status);
      
      let impact = 0;
      if (isDebit) impact = -w.amount; 

      return {
        id: `wt-${w.id}`,
        type: 'WITHDRAWAL',
        description: `Saque Solicitado`,
        producerName: w.producer.name,
        amount: w.amount,
        fee: w.fee,
        impact,
        status: w.status,
        date: w.createdAt,
        method: 'TRANSFER', // Saques costuma ser transferência/pix
        installments: '',
        cardBrand: '',
      };
    });

    let currentBalance = initialBalance;
    const combined = [...mappedTransactions, ...mappedWithdrawals].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    const statement = combined.map(item => {
      currentBalance += item.impact;
      return {
        ...item,
        runningBalance: currentBalance
      };
    });

    // Retorna ordenado do mais recente para o mais antigo (extrato tradicional)
    return statement.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
