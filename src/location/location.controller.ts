import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { Location } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationTreeNode } from './types';

@ApiTags('locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({
    status: 201,
    description: 'The location has been successfully created.',
    type: Location,
  })
  async create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<Location> {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({
    status: 200,
    description: 'Return all locations.',
    type: [Location],
  })
  async findAll(): Promise<Location[]> {
    return this.locationService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get the location tree' })
  @ApiResponse({
    status: 200,
    description: 'Return the location tree.',
    type: [Location],
  })
  async findTree(): Promise<LocationTreeNode[]> {
    return this.locationService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the location.',
    type: Location,
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  async findOne(@Param('id') id: string): Promise<Location> {
    if (isNaN(Number(id))) {
      throw new NotFoundException('Invalid ID');
    }

    const location = await this.locationService.findOne(Number(id));
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return location;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiResponse({
    status: 200,
    description: 'The location has been successfully updated.',
    type: Location,
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.locationService.update(
      Number(id),
      updateLocationDto,
    );
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return location;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location' })
  @ApiResponse({
    status: 200,
    description: 'The location has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Location not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    const deleted = await this.locationService.remove(Number(id));
    if (!deleted) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
  }
}
