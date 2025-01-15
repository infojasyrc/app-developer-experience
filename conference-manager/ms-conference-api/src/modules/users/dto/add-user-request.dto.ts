import { ApiProperty } from '@nestjs/swagger'

export class AdddUserRequestDto {
  @ApiProperty({
    description: 'user auth id from service provider',
    required: true,
  })
  uid!: string

  @ApiProperty({
    description: 'User first name',
    required: true,
  })
  firstName!: string

  @ApiProperty({
    description: 'User last name',
    required: true,
  })
  lastName!: string

  @ApiProperty({
    description: 'User email address',
    required: true,
  })
  email!: string
}
