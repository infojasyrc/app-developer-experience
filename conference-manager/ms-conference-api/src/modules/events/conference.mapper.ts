import { Injectable } from '@nestjs/common'
import { ConferenceStatus } from './conference-status'

@Injectable()
export default class ConferenceMapper {
  public static getAllMapper() {
    return {
      status: ConferenceStatus.ACTIVE,
    }
  }
}
