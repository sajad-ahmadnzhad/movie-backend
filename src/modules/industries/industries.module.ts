import { Module } from '@nestjs/common';
import { IndustriesService } from './industries.service';
import { IndustriesController } from './industries.controller';

@Module({
  controllers: [IndustriesController],
  providers: [IndustriesService],
})
export class IndustriesModule {}
