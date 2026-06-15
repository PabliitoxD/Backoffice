import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Monitoring')
@ApiBearerAuth()
@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('checkout')
  @ApiOperation({ summary: 'Retorna status atual e histórico do checkout' })
  getCheckoutStatus() {
    return this.monitoringService.getStatus();
  }

  @Post('checkout/check')
  @ApiOperation({ summary: 'Dispara uma verificação imediata do checkout' })
  async triggerCheck() {
    await this.monitoringService.runCheck();
    return this.monitoringService.getStatus();
  }
}
