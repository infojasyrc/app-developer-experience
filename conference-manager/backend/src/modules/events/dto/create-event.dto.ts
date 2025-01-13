import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Headquarter } from '../../headquarter/headquarter.entity'
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateEventDto {
  @ApiProperty({
    description: 'The event date',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  eventDate!: Date

  @ApiProperty({
    description: 'The event tag',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  tags!: string

  @ApiProperty({
    description: 'The event name',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({
    description: 'The event type',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  type!: string

  @ApiProperty({
    description: 'The event address',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  address!: string

  @ApiHideProperty()
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    description: 'The event description',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description!: string

  @ApiProperty({
    description: 'The event headquarter id',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  headquarter!: Headquarter

  @ApiProperty({
    description: 'The event image',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File
}

export enum EventStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CREATED = 'created',
}
