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

  @Get()
  findAll(
    @Query('producerId') producerId?: string,
    @Query('status') status?: string,
  ) {
    return this.withdrawalsService.findAll({ producerId, status });
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.withdrawalsService.updateStatus(id, status);
  }
}
