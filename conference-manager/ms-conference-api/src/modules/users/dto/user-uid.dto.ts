import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UserUidDto {
  @ApiProperty({ description: 'Firebase auth uid' })
  @IsString()
  @IsNotEmpty()
  uid!: string
}
