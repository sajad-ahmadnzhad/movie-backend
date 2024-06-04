import { Injectable } from '@nestjs/common';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';

@Injectable()
export class IndustriesService {
  create(createIndustryDto: CreateIndustryDto) {
    return 'This action adds a new industry';
  }

  findAll() {
    return `This action returns all industries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} industry`;
  }

  update(id: number, updateIndustryDto: UpdateIndustryDto) {
    return `This action updates a #${id} industry`;
  }

  remove(id: number) {
    return `This action removes a #${id} industry`;
  }
}
