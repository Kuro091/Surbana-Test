import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  building: string;

  @IsString()
  @IsNotEmpty()
  locationName: string;

  @IsString()
  @IsNotEmpty()
  locationNumber: string;

  @IsNumber()
  area: number;

  @IsOptional()
  parentId?: number;
}
