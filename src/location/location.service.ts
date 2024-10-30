import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Location } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

interface LocationTreeNode {
  id: number;
  name: string;
  locationNumber: string;
  building: string;
  area: number;
  children: LocationTreeNode[];
}

interface PostgresError extends Error {
  code: string;
  message: string;
}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    try {
      this.logger.log(
        `Creating new location: ${createLocationDto.locationName}`,
      );
      const location = this.locationRepository.create(createLocationDto);

      if (createLocationDto.parentId) {
        const parent = await this.locationRepository.findOne({
          where: { id: createLocationDto.parentId },
        });

        if (!parent) {
          throw new NotFoundException(
            `Parent location with ID ${createLocationDto.parentId} not found`,
          );
        }

        if (location.id === parent.id) {
          throw new BadRequestException('A location cannot be its own parent.');
        }

        if (await this.isDescendant(location.id, parent.id)) {
          throw new BadRequestException(
            'A location cannot be its own ancestor.',
          );
        }

        location.parent = parent;
      }

      const savedLocation = await this.locationRepository.save(location);
      this.logger.log(
        `Successfully created location with ID: ${savedLocation.id}`,
      );
      return savedLocation;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create location: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof QueryFailedError) {
        const queryError = error as QueryFailedError<PostgresError>;
        if (queryError.driverError.code === '23505') {
          throw new BadRequestException(`Location number must be unique.`);
        }
      }

      throw new BadRequestException(
        `Failed to create location: ${(error as Error).message}`,
      );
    }
  }

  async findAll(): Promise<Location[]> {
    try {
      this.logger.log('Fetching all locations');
      return await this.locationRepository.find({
        relations: ['parent', 'children'],
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch locations: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException('Failed to fetch locations');
    }
  }

  async findOne(id: number): Promise<Location> {
    try {
      this.logger.log(`Fetching location with ID: ${id}`);
      const location = await this.locationRepository.findOne({
        where: { id },
        relations: ['parent', 'children'],
      });

      if (!location) {
        this.logger.warn(`Location with ID ${id} not found`);
        throw new NotFoundException(`Location with ID ${id} not found`);
      }

      return location;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch location ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch location: ${(error as Error).message}`,
      );
    }
  }

  private async loadLocationTreeRecursive(
    locationIds: number[],
  ): Promise<LocationTreeNode[]> {
    try {
      if (!locationIds.length) return [];

      const locations = await this.locationRepository
        .createQueryBuilder('location')
        .leftJoinAndSelect('location.children', 'children')
        .where('location.id IN (:...ids)', { ids: locationIds })
        .getMany();

      const result: LocationTreeNode[] = [];

      for (const location of locations) {
        const treeNode: LocationTreeNode = {
          id: location.id,
          name: location.locationName,
          locationNumber: location.locationNumber,
          building: location.building,
          area: location.area,
          children: [],
        };

        if (location.children?.length > 0) {
          const childIds = location.children.map((child) => child.id);
          treeNode.children = await this.loadLocationTreeRecursive(childIds);
        }

        result.push(treeNode);
      }

      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to load location tree: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException(
        `Failed to load location tree: ${(error as Error).message}`,
      );
    }
  }

  async findTree(): Promise<LocationTreeNode[]> {
    try {
      this.logger.log('Fetching location tree');
      const roots = await this.locationRepository
        .createQueryBuilder('location')
        .where('location.parent IS NULL')
        .getMany();

      return this.loadLocationTreeRecursive(roots.map((root) => root.id));
    } catch (error: unknown) {
      this.logger.error(
        `Failed to fetch location tree: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new BadRequestException(
        `Failed to fetch location tree: ${(error as Error).message}`,
      );
    }
  }

  async update(
    id: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    try {
      this.logger.log(`Updating location with ID: ${id}`);
      const location = await this.findOne(id);

      const { parentId } = updateLocationDto;

      if (parentId) {
        const parent = await this.locationRepository.findOne({
          where: { id: parentId },
        });
        if (!parent) {
          throw new NotFoundException(
            `Parent location with ID ${parentId} not found`,
          );
        }

        if (location.id === parent.id) {
          throw new BadRequestException('A location cannot be its own parent.');
        }

        if (await this.isDescendant(location.id, parent.id)) {
          throw new BadRequestException(
            'A location cannot be its own ancestor.',
          );
        }

        location.parent = parent;
      } else {
        location.parent = null;
      }

      Object.assign(location, updateLocationDto);
      const updatedLocation = await this.locationRepository.save(location);
      this.logger.log(`Successfully updated location with ID: ${id}`);
      return updatedLocation;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to update location ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update location: ${(error as Error).message}`,
      );
    }
  }

  async remove(id: number) {
    try {
      this.logger.log(`Removing location with ID: ${id}`);
      const location = await this.findOne(id);

      if (location.children?.length > 0) {
        throw new BadRequestException(
          'Cannot delete location with existing children',
        );
      }

      const result = await this.locationRepository.remove(location);

      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to remove location ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to remove location: ${(error as Error).message}`,
      );
    }
  }

  private async isDescendant(
    locationId: number,
    parentId: number,
  ): Promise<boolean> {
    const location = await this.locationRepository.findOne({
      where: { id: locationId },
      relations: ['children'],
    });

    if (!location || !location.children) {
      return false;
    }

    const isChild = location.children.some((child) => child.id === parentId);

    const hasDescendant = await Promise.all(
      location.children.map((child) => this.isDescendant(child.id, parentId)),
    );

    return isChild || hasDescendant.includes(true);
  }
}
