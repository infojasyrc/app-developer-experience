import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class HeadquarterIdDto {
  @ApiProperty({ description: 'Headquarter MongoDB ObjectId' })
  @IsString()
  @IsNotEmpty()
  headquarterId!: string
}
