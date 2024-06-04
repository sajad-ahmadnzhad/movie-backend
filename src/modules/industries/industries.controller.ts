import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IndustriesService } from './industries.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';

@Controller('industries')
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  @Post()
  create(@Body() createIndustryDto: CreateIndustryDto) {
    return this.industriesService.create(createIndustryDto);
  }

  @Get()
  findAll() {
    return this.industriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.industriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIndustryDto: UpdateIndustryDto) {
    return this.industriesService.update(+id, updateIndustryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.industriesService.remove(+id);
  }
}
