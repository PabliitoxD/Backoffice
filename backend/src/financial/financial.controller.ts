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

  @Get('statement')
  @ApiOperation({ summary: 'Obtem o extrato unificado de todas as transações e saques' })
  getGlobalStatement(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string
  ) {
    return this.financialService.getGlobalStatement(startDate, endDate, search);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtem as estatísticas da dashboard com comparativo' })
  getDashboardStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.financialService.getDashboardStats(startDate, endDate);
  }
}
