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

  @Get()
  @ApiOperation({ summary: 'Lista todos os monitores configurados' })
  listTargets() {
    return this.monitoringService.listTargets();
  }

  @Get(':service/status')
  @ApiOperation({ summary: 'Retorna status atual e histórico de um serviço' })
  getStatus(@Param('service') service: string) {
    return this.monitoringService.getStatus(service);
  }

  @Post(':service/check')
  @ApiOperation({ summary: 'Dispara uma verificação imediata de um serviço' })
  async triggerCheck(@Param('service') service: string) {
    return this.monitoringService.triggerCheck(service);
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
    @Body() body: { content: string; author: string; periodStart?: string; periodEnd?: string },
  ) {
    return this.monitoringService.addNote(service, body.content, body.author, body.periodStart, body.periodEnd);
  }

  @Delete('notes/:id')
  @ApiOperation({ summary: 'Remove uma nota da equipe' })
  deleteNote(@Param('id') id: string) {
    return this.monitoringService.deleteNote(id);
  }
}
