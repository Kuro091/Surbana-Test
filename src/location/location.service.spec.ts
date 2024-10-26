import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { Location } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mockDeep } from 'jest-mock-extended';

describe('LocationService', () => {
  let service: LocationService;
  let repository: Repository<Location>;
  const logger = mockDeep<Logger>(); // Create a deep mock of Logger

  const mockLocation = {
    id: 1,
    locationName: 'Test Location',
    building: 'A',
    locationNumber: 'A-01',
    area: 100.0,
    children: [],
    parent: null,
  };

  const mockLocationRepository = {
    create: jest.fn((dto: CreateLocationDto) => ({
      id: 1,
      ...dto,
    })),
    save: jest.fn((location: Location) =>
      Promise.resolve({
        id: 1,
        ...location,
      }),
    ),
    find: jest.fn(() => Promise.resolve([mockLocation])),
    findOne: jest.fn(({ where, relations }) => {
      if (where.id === 1) {
        return Promise.resolve({
          ...mockLocation,
          // Include relations if they were requested
          ...(relations?.includes('children') ? { children: [] } : {}),
          ...(relations?.includes('parent') ? { parent: null } : {}),
        });
      }
      return Promise.resolve(null);
    }),
    remove: jest.fn((location: Location) => Promise.resolve(mockLocation)),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockLocation]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: getRepositoryToken(Location),
          useValue: mockLocationRepository,
        },
        {
          provide: Logger,
          useValue: logger, // Use the mocked logger
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    repository = module.get<Repository<Location>>(getRepositoryToken(Location));

    module.useLogger(logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a location', async () => {
    const dto: CreateLocationDto = {
      building: 'A',
      locationName: 'Test Location',
      locationNumber: 'A-01',
      area: 100.0,
    };

    const result = await service.create(dto);
    expect(result).toEqual({ id: 1, ...dto });
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalled();
  });

  it('should return all locations', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockLocation]);
    expect(repository.find).toHaveBeenCalledWith({
      relations: ['parent', 'children'],
    });
  });

  it('should return a location by ID', async () => {
    const result = await service.findOne(1);
    expect(result).toEqual({
      ...mockLocation,
      children: [],
      parent: null,
    });
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['parent', 'children'],
    });
  });

  it('should throw NotFoundException when location not found', async () => {
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
  });

  it('should update a location', async () => {
    const dto: UpdateLocationDto = { locationName: 'Updated Location' };
    const result = await service.update(1, dto);
    expect(result).toEqual(
      expect.objectContaining({
        id: 1,
        locationName: 'Updated Location',
      }),
    );
  });

  it('should throw NotFoundException when updating a non-existing location', async () => {
    await expect(service.update(2, {})).rejects.toThrow(NotFoundException);
  });

  it('should delete a location', async () => {
    const result = await service.remove(1);
    expect(result).toEqual(mockLocation);
  });

  it('should throw BadRequestException when deleting a location with children', async () => {
    // Temporarily modify the mock to return a location with children
    mockLocationRepository.findOne.mockImplementationOnce(({ where }) => {
      if (where.id === 1) {
        return Promise.resolve({
          ...mockLocation,
          children: [{ id: 2 }],
        });
      }
      return Promise.resolve(null);
    });

    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when deleting a non-existing location', async () => {
    await expect(service.remove(2)).rejects.toThrow(NotFoundException);
  });
});
