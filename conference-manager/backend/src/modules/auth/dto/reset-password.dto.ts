import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({ description: 'Email address to send the password reset link', required: true })
  @IsEmail()
  @IsNotEmpty()
  email!: string
}
