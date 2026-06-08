import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ description: 'Firebase auth uid', required: true })
  @IsString()
  @IsNotEmpty()
  uid!: string

  @ApiProperty({ description: 'User first name', required: true })
  @IsString()
  @IsNotEmpty()
  firstName!: string

  @ApiProperty({ description: 'User last name', required: true })
  @IsString()
  @IsNotEmpty()
  lastName!: string

  @ApiProperty({ description: 'User email address', required: true })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  createdBy?: string
}
