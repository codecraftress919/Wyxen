import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateSiteDto } from './dtos/create-site.dto.js';
import { SitesService } from './sites.service.js';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  findByAddressQuery(@Query('address') address: string) {
    return this.sitesService.findByAddress(address);
  }

  @Get(':address')
  findByAddress(@Param('address') address: string) {
    return this.sitesService.findByAddress(address);
  }

  @Post()
  create(@Body() dto: CreateSiteDto) {
    return this.sitesService.create(dto);
  }
}
