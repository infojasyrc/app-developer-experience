import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Headquarter } from '../../headquarter/headquarter.entity'

export class CreateConferenceDto {
  @ApiProperty({ description: 'Conference date', required: true })
  @IsDateString()
  @IsNotEmpty()
  eventDate!: Date

  @ApiProperty({ description: 'Comma-separated tags', required: true })
  @IsString()
  @IsNotEmpty()
  tags!: string

  @ApiProperty({ description: 'Unique conference name', required: true })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ description: 'Conference type', required: true })
  @IsString()
  @IsNotEmpty()
  type!: string

  @ApiProperty({ description: 'Physical address', required: true })
  @IsString()
  @IsNotEmpty()
  address!: string

  @ApiHideProperty()
  @IsString()
  @IsNotEmpty()
  createdBy!: string

  @ApiProperty({ description: 'Conference description', required: true })
  @IsString()
  @IsNotEmpty()
  description!: string

  @ApiProperty({ description: 'Headquarter ObjectId', required: true })
  @IsString()
  @IsNotEmpty()
  headquarter!: Headquarter

  @ApiProperty({ description: 'Cover image (JPEG)', required: false })
  @IsOptional()
  image?: Express.Multer.File
}
