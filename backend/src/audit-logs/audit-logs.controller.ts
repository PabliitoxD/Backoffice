import { Controller, Get, Query, UseGuards } from '@nestjs/common';
<<<<<<< HEAD
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Audit Logs')
@ApiBearerAuth()
=======
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

>>>>>>> Feature/0004/login-singup
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogsService.findAll({
      userId,
      action,
      limit: limit ? parseInt(limit) : 100,
    });
  }
}
