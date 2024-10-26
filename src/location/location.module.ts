import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { Location } from './location.entity';
import { LocationSeed } from './seeds/location.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
  ],
  controllers: [LocationController],
  providers: [LocationService, LocationSeed],
})
export class LocationModule {}
