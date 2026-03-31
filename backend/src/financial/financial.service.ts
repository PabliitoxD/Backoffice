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

    const transactionWhere = { ...whereClause };
    const withdrawalWhere = { ...whereClause };

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
      // WAITING/APPROVED/COMPLETED = Adiciona saldo (crédito)
      // CHARGEBACK/REFUNDED/REVERSED/CLAIMED = Retira saldo (débito)
      const isCredit = ['WAITING', 'APPROVED', 'COMPLETED'].includes(t.status);
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
      // Saques (aprovados ou concluídos) descontam saldo
      const isDebit = ['APPROVED', 'COMPLETED', 'PENDING'].includes(w.status);
      
      let impact = 0;
      if (isDebit) impact = -w.amount; // Deduz o valor total solicitado (valor líquido + tarifa)

      return {
        id: `wt-${w.id}`,
        type: 'WITHDRAWAL',
        description: `Saque Solicitado`,
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
}
