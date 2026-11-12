import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class AddAttendeeToConferenceDto {
  @ApiProperty({ description: 'Attendee first name', required: true })
  @IsString()
  @IsNotEmpty()
  name!: string

  @ApiProperty({ description: 'Attendee last name', required: true })
  @IsString()
  @IsNotEmpty()
  lastName!: string

  @ApiProperty({ description: 'Attendee email', required: true })
  @IsEmail()
  @IsNotEmpty()
  email!: string
}
