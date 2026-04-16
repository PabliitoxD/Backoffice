import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Financial')
@ApiBearerAuth()
@Controller('financial')
@UseGuards(JwtAuthGuard)
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('dashboard-summary')
  @ApiOperation({ summary: 'Obtem o resumo estatístico para o dashboard principal' })
  getDashboardSummary() {
    return this.financialService.getDashboardSummary();
  }

  @Get('statement')
  @ApiOperation({ summary: 'Obtem o extrato unificado de todas as transações e saques' })
  getGlobalStatement(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string
  ) {
    return this.financialService.getGlobalStatement(startDate, endDate, search);
  }
}
