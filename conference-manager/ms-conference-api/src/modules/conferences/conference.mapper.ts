import { Injectable } from '@nestjs/common'
import { ConferenceStatus } from './conference.enum'

@Injectable()
export default class ConferenceMapper {
  public static getAllMapper() {
    return {
      status: ConferenceStatus.ACTIVE,
    }
  }
}
