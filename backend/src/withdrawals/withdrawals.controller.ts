import { Controller, Get, Post, Body, Query, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Withdrawals')
@ApiBearerAuth()
@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  create(@Body() data: { amount: number; producerId: string }) {
    return this.withdrawalsService.create(data);
  }

  @Post('notify-finance')
  notifyFinance(@Body() data: { withdrawalIds: string[] }) {
    return this.withdrawalsService.notifyFinance(data);
  }

  @Get()
  findAll(
    @Query('producerId') producerId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.withdrawalsService.findAll({ producerId, status, startDate, endDate, search });
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('observation') observation?: string
  ) {
    return this.withdrawalsService.updateStatus(id, status, observation);
  }
}
