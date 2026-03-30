import { Controller, Patch, Param, UseGuards, Get, Query } from '@nestjs/common';
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
  ) {
    return this.transactionsService.findAll({ status, producerId });
  }

  @Patch(':id/chargeback')
  @ApiOperation({ summary: 'Marca uma transação como Chargeback (Estorno da Adquirente)' })
  markChargeback(@Param('id') id: string) {
    return this.transactionsService.markChargeback(id);
  }
}
