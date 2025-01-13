import { ApiProperty } from '@nestjs/swagger'

export class UserRequestDto {
  @ApiProperty({
    description: 'user auth id from service provider',
    required: true,
  })
  uid!: string
}
