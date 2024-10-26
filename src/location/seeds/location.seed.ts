import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../location.entity';

@Injectable()
export class LocationSeed {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async run() {
    await this.locationRepository.clear();

    const carPark = this.locationRepository.create({
      building: 'A',
      locationName: 'Car Park',
      locationNumber: 'A-CarPark',
      area: 80.62,
      parent: null,
    });

    const level5 = this.locationRepository.create({
      building: 'B',
      locationName: 'Level 5',
      locationNumber: 'B-05',
      area: 150.0,
      parent: null,
    });

    await this.locationRepository.save([carPark, level5]);

    const level1 = this.locationRepository.create({
      building: 'A',
      locationName: 'Level 1',
      locationNumber: 'A-01',
      area: 100.92,
      parent: carPark,
    });

    await this.locationRepository.save(level1);

    const lobbyLevel1 = this.locationRepository.create({
      building: 'A',
      locationName: 'Lobby Level 1',
      locationNumber: 'A-01-Lobby',
      area: 80.62,
      parent: level1,
    });

    const masterRoom = this.locationRepository.create({
      building: 'A',
      locationName: 'Master Room',
      locationNumber: 'A-01-01',
      area: 50.11,
      parent: level1,
    });

    const meetingRoom1 = this.locationRepository.create({
      building: 'A',
      locationName: 'Meeting Room 1',
      locationNumber: 'A-01-M1',
      area: 20.11,
      parent: level1,
    });

    const corridorLevel1 = this.locationRepository.create({
      building: 'A',
      locationName: 'Corridor Level 1',
      locationNumber: 'A-01-Corridor',
      area: 30.2,
      parent: level1,
    });

    const toiletLevel1 = this.locationRepository.create({
      building: 'A',
      locationName: 'Toilet Level 1',
      locationNumber: 'A-01-02',
      area: 30.2,
      parent: level1,
    });

    const utilityRoom = this.locationRepository.create({
      building: 'B',
      locationName: 'Utility Room',
      locationNumber: 'B-05-11',
      area: 10.2,
      parent: level5,
    });

    const sanitaryRoom = this.locationRepository.create({
      building: 'B',
      locationName: 'Sanitary Room',
      locationNumber: 'B-05-12',
      area: 12.2,
      parent: level5,
    });

    const maleToilet = this.locationRepository.create({
      building: 'B',
      locationName: 'Male Toilet',
      locationNumber: 'B-05-13',
      area: 30.2,
      parent: level5,
    });

    const gensetRoom = this.locationRepository.create({
      building: 'B',
      locationName: 'Genset Room',
      locationNumber: 'B-05-14',
      area: 35.2,
      parent: level5,
    });

    const pantryLevel5 = this.locationRepository.create({
      building: 'B',
      locationName: 'Pantry Level 5',
      locationNumber: 'B-05-15',
      area: 50.2,
      parent: level5,
    });

    const corridorLevel5 = this.locationRepository.create({
      building: 'B',
      locationName: 'Corridor Level 5',
      locationNumber: 'B-05-Corridor',
      area: 30.0,
      parent: level5,
    });

    await this.locationRepository.save([
      lobbyLevel1,
      masterRoom,
      meetingRoom1,
      corridorLevel1,
      toiletLevel1,
      utilityRoom,
      sanitaryRoom,
      maleToilet,
      gensetRoom,
      pantryLevel5,
      corridorLevel5,
    ]);
  }
}
