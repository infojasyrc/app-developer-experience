import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class AddAttendeeToEventDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsNotEmpty()
  lastName!: string

  @IsEmail()
  @IsNotEmpty()
  email!: string
}
