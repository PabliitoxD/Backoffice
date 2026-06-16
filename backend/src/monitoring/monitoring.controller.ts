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
    return this.monitoringService.getCheckoutStatus();
  }

  @Post('checkout/check')
  @ApiOperation({ summary: 'Dispara uma verificação imediata do checkout' })
  async triggerCheckout() {
    return this.monitoringService.triggerCheckout();
  }

  @Get('app')
  @ApiOperation({ summary: 'Retorna status atual e histórico do app' })
  getAppStatus() {
    return this.monitoringService.getAppStatus();
  }

  @Post('app/check')
  @ApiOperation({ summary: 'Dispara uma verificação imediata do app' })
  async triggerApp() {
    return this.monitoringService.triggerApp();
  }
}
