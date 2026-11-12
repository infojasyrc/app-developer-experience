import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @ApiProperty({ description: 'User email address', required: true })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({ description: 'Password (min 6 characters)', required: true, minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string

  @ApiProperty({ description: 'User first name', required: true })
  @IsString()
  @IsNotEmpty()
  firstName!: string

  @ApiProperty({ description: 'User last name', required: true })
  @IsString()
  @IsNotEmpty()
  lastName!: string

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  createdBy?: string
}
