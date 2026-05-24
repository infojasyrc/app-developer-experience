import { Injectable } from '@nestjs/common'
import { HeadquarterResponse } from './interfaces/headquarter-response'
import { Headquarter } from './headquarter.entity'
import { CreateHeadquarterDto } from './dto/create-headquarter.dto'
import { UpdateHeadquarterDto } from './dto/update-headquarter.dto'

@Injectable()
export default class HeadquarterMapper {
  public static toResponse(headquarter: Headquarter): HeadquarterResponse {
    return {
      _id: String(headquarter._id),
      name: headquarter.name,
    }
  }

  public static toResponseList(headquarters: Headquarter[]): HeadquarterResponse[] {
    return headquarters.map(hq => this.toResponse(hq))
  }

  public static createHeadquarterMapper(dto: CreateHeadquarterDto): Partial<Headquarter> {
    return { name: dto.name }
  }

  public static updateHeadquarterMapper(dto: UpdateHeadquarterDto): Partial<Headquarter> {
    const update: Partial<Headquarter> = {}
    if (dto.name !== undefined) update.name = dto.name
    return update
  }
}
