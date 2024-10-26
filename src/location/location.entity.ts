import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Location {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the location',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'A', description: 'The building identifier' })
  @Column()
  building: string;

  @ApiProperty({ example: 'Car Park', description: 'The name of the location' })
  @Column()
  locationName: string;

  @ApiProperty({ example: 'A-CarPark', description: 'The location number' })
  @Column()
  locationNumber: string;

  @ApiProperty({
    example: 80.62,
    description: 'The area of the location in square meters',
  })
  @Column('decimal')
  area: number;

  @OneToMany(() => Location, (location) => location.parent)
  children: Location[];

  @ManyToOne(() => Location, (location) => location.children, {
    nullable: true,
  })
  parent: Location | null;
}
