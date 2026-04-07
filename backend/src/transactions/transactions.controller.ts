import { Controller, Patch, Param, UseGuards, Get, Query, Body, Post, Patch as PatchAction } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtem a lista de transações (filtrável por status e producer)' })
  findAll(
    @Query('status') status?: string,
    @Query('producerId') producerId?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.findAll({ status, producerId, search, startDate, endDate });
  }

  @Patch(':id/chargeback')
  @ApiOperation({ summary: 'Marca uma transação como Chargeback (Estorno da Adquirente)' })
  markChargeback(@Param('id') id: string) {
    return this.transactionsService.markChargeback(id);
  }

  @Patch(':id/chargeback/observation')
  @ApiOperation({ summary: 'Atualiza observação de um chargeback' })
  updateObservation(@Param('id') id: string, @Body('observation') observation: string) {
    return this.transactionsService.updateChargebackObservation(id, observation);
  }

  @Post(':id/extra-charge')
  @ApiOperation({ summary: 'Lança uma cobrança extra referente a um chargeback expirado' })
  launchExtraCharge(
    @Param('id') id: string, 
    @Body('amount') amount: number, 
    @Body('reason') reason: string
  ) {
    return this.transactionsService.launchExtraCharge(id, amount, reason);
  }
}
