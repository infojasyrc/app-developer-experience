import { Injectable } from '@nestjs/common'
import { HeadquarterResponse } from './interfaces/headquarter-response'
import { Headquarter } from './headquarter.entity'

@Injectable()
export default class HeadquarterMapper {
  public static headquarterMapper(headquarters: Headquarter[]): HeadquarterResponse[] {
    return headquarters.map(headquarter => {
      return this.fromDomain(headquarter)
    })
  }

  public static fromDomain(headquarter: Headquarter): HeadquarterResponse {
    const response: HeadquarterResponse = {
      name: headquarter.name,
    }

    return response
  }
}
