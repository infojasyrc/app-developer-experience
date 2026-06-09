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
      city: headquarter.city,
      country: headquarter.country,
      createdBy: headquarter.createdBy,
      updatedBy: headquarter.updatedBy,
      createdAt: headquarter.createdAt,
      updatedAt: headquarter.updatedAt,
    }
  }

  public static toResponseList(headquarters: Headquarter[]): HeadquarterResponse[] {
    return headquarters.map(hq => this.toResponse(hq))
  }

  public static createHeadquarterMapper(dto: CreateHeadquarterDto): Partial<Headquarter> {
    return {
      city: dto.city,
      country: dto.country,
      createdBy: dto.createdBy ?? '',
    }
  }

  public static updateHeadquarterMapper(dto: UpdateHeadquarterDto): Partial<Headquarter> {
    const update: Partial<Headquarter> = {}
    if (dto.city    !== undefined) update.city    = dto.city
    if (dto.country !== undefined) update.country = dto.country
    if (dto.updatedBy !== undefined) update.updatedBy = dto.updatedBy
    return update
  }
}
