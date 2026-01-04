import {
  Controller,
  HttpCode,
  Logger,
  Get,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ConferenceService } from './conference.service'
import { RequestGetAllEventsDto } from './dto/request-get-all-events.dto'
import { Conference } from './conference.entity'

@ApiTags('conferences')
@Controller('v2/conferences')
export class ConferenceController {
  constructor(private readonly conferenceService: ConferenceService, private logger: Logger) {}

  @Get()
  @HttpCode(200)
  async getAll(@Query() params: RequestGetAllEventsDto): Promise<Conference[]> {
    this.logger.log('Get all conferences controller')
    return this.conferenceService.getAll()
  }
}
