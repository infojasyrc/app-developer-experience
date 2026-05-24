import { Injectable } from '@nestjs/common'
import { ConferenceStatus } from './conference.enum'
import { Conference } from './conference.entity'
import { CreateConferenceDto } from './dto/create-conference.dto'
import { UpdateConferenceDto } from './dto/update-conference.dto'
import { RequestGetAllConferencesDto } from './dto/request-get-all-conferences.dto'

@Injectable()
export default class ConferenceMapper {
  public static createConferenceMapper(dto: CreateConferenceDto): Conference {
    const { eventDate, userId, ...rest } = dto
    const parsedDate = new Date(eventDate)
    return {
      ...rest,
      eventDate: parsedDate,
      year: parsedDate.getFullYear().toString(),
      status: ConferenceStatus.CREATED,
      owner: userId,
    } as Conference
  }

  public static updateConferenceMapper(dto: UpdateConferenceDto): Partial<Conference> {
    const mapped: Partial<Conference> = { ...dto } as Partial<Conference>
    if (dto.eventDate) {
      mapped.eventDate = new Date(dto.eventDate)
      mapped.year = mapped.eventDate.getFullYear().toString()
    }
    return mapped
  }

  public static getAllMapper(params: RequestGetAllConferencesDto): Record<string, unknown> {
    const { isAdmin, userId, ...filters } = params
    return isAdmin
      ? { owner: userId, ...filters }
      : { status: ConferenceStatus.ACTIVE, ...filters }
  }
}
