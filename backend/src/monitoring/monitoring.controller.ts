import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
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

  @Get(':service/notes')
  @ApiOperation({ summary: 'Lista notas da equipe para um serviço' })
  getNotes(@Param('service') service: string) {
    return this.monitoringService.getNotes(service);
  }

  @Post(':service/notes')
  @ApiOperation({ summary: 'Adiciona uma nota da equipe' })
  addNote(
    @Param('service') service: string,
    @Body() body: { content: string; author: string },
  ) {
    return this.monitoringService.addNote(service, body.content, body.author);
  }

  @Delete('notes/:id')
  @ApiOperation({ summary: 'Remove uma nota da equipe' })
  deleteNote(@Param('id') id: string) {
    return this.monitoringService.deleteNote(id);
  }
}
