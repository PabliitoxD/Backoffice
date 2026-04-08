import {
  Controller, Patch, Param, UseGuards, Get, Query, Body,
  Post, UseInterceptors, UploadedFiles, BadRequestException, Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtem a lista de transações (filtrável por status e producer)' })
  findAll(
    @Query('status') status?: string,
    @Query('producerId') producerId?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.transactionsService.findAll({ status, producerId, search, startDate, endDate });
  }

  @Patch(':id/chargeback')
  @ApiOperation({ summary: 'Marca uma transação como Chargeback (Estorno da Adquirente)' })
  async markChargeback(@Param('id') id: string) {
    return this.transactionsService.markChargeback(id);
  }

  @Patch(':id/chargeback/observation')
  @ApiOperation({ summary: 'Atualiza observação de um chargeback' })
  async updateObservation(
    @Param('id') id: string,
    @Body('observation') observation: string,
  ) {
    return this.transactionsService.updateChargebackObservation(id, observation);
  }

  @Post(':id/extra-charge')
  @ApiOperation({ summary: 'Lança uma cobrança extra referente a um chargeback expirado' })
  async launchExtraCharge(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
  ) {
    return this.transactionsService.launchExtraCharge(id, amount, reason);
  }

  @Post(':id/chargeback/defense')
  @ApiOperation({ summary: 'Submete defesa de chargeback com arquivos e descrição para a adquirente' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/chargeback-defense',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
          return cb(new BadRequestException(`Tipo de arquivo não permitido: ${ext}. Use PDF, DOC ou DOCX.`), false);
        }
        cb(null, true);
      },
    }),
  )
  async submitDefense(
    @Param('id') id: string,
    @Body('description') description: string,
    @UploadedFiles() files: any[],
    @Req() req: any,
  ) {

    if (!description) throw new BadRequestException('A descrição da defesa é obrigatória.');

    const result = await this.transactionsService.submitChargebackDefense(id, description, files || []);
    
    // Log manual pois essa rota é ignorada pelo interceptor multipart
    const user = (req as any).user;
    await this.auditLogsService.logAction({
      userId: user?.sub || user?.id,
      action: 'CREATE_TRANSACTIONS_CHARGEBACK_DEFENSE',
      entity: 'Transactions',
      entityId: id,
      details: { 
        description, 
        files: files?.map(f => f.originalname) || [] 
      },
      ip: req.ip,
    });

    return result;
  }
}

