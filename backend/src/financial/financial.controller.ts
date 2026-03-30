import { Controller, Get, UseGuards } from '@nestjs/common';
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
  getGlobalStatement() {
    return this.financialService.getGlobalStatement();
  }
}
