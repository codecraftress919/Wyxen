import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HistoryQueryDto } from '../common/dtos.js';
import { CreateVisitDto } from './dtos/create-visit.dto.js';
import { VisitsService } from './visits.service.js';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  create(@Body() dto: CreateVisitDto) {
    return this.visitsService.create(dto);
  }

  @Get()
  history(@Query() query: HistoryQueryDto) {
    return this.visitsService.history(query.personId, query.limit, query.cursor);
  }
}
