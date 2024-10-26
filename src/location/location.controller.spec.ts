import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Logger, NotFoundException } from '@nestjs/common';
import { Location } from './location.entity';
import { mockDeep } from 'jest-mock-extended';

// Mock the Logger class
const mockLogger = mockDeep<Logger>();

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;

  const mockLocationService = {
    create: jest.fn((dto: CreateLocationDto) => {
      return Promise.resolve({ id: 1, ...dto });
    }),
    findAll: jest.fn(() => {
      return Promise.resolve([{ id: 1, locationName: 'Test Location' }]);
    }),
    findOne: jest.fn((id: number) => {
      if (id === 1) {
        return Promise.resolve({ id, locationName: 'Test Location' });
      }
      return Promise.reject(
        new NotFoundException(`Location with ID ${id} not found`),
      );
    }),
    update: jest.fn((id: number, dto: UpdateLocationDto) => {
      if (id === 1) {
        return Promise.resolve({ id, ...dto });
      }
      return Promise.reject(
        new NotFoundException(`Location with ID ${id} not found`),
      );
    }),
    remove: jest.fn((id: number) => {
      if (id === 1) {
        return Promise.resolve({
          id: 1,
          locationName: 'Test Location',
          building: 'A',
          locationNumber: 'A-01',
          area: 100.0,
        } as Location);
      }
      return Promise.reject(
        new NotFoundException(`Location with ID ${id} not found`),
      );
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
        {
          provide: Logger,
          useValue: mockLogger, // Use the mocked logger
        },
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);

    module.useLogger(mockLogger);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a location', async () => {
    const dto: CreateLocationDto = {
      locationName: 'Test Location',
      building: 'A',
      locationNumber: 'A-01',
      area: 100.0,
    };

    const result = await controller.create(dto);
    expect(result).toEqual(expect.objectContaining({ id: 1, ...dto }));
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all locations', async () => {
    const result = await controller.findAll();
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, locationName: 'Test Location' }),
      ]),
    );
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a location by ID', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual(
      expect.objectContaining({
        id: 1,
        locationName: 'Test Location',
      }),
    );
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException for invalid ID', async () => {
    await expect(controller.findOne('2')).rejects.toThrow(NotFoundException);
  });

  it('should update a location', async () => {
    const dto: UpdateLocationDto = { locationName: 'Updated Location' };
    const result = await controller.update('1', dto);
    expect(result).toEqual(expect.objectContaining({ id: 1, ...dto }));
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should throw NotFoundException when updating a non-existing location', async () => {
    await expect(controller.update('2', {})).rejects.toThrow(NotFoundException);
  });

  // Modified delete test
  it('should delete a location', async () => {
    await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when deleting a non-existing location', async () => {
    await expect(controller.remove('2')).rejects.toThrow(NotFoundException);
  });
});
