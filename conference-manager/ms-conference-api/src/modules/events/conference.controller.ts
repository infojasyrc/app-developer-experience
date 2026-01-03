import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ConferenceService } from './conference.service'
import { UpdateEventDto } from './dto/update-event.dto'
import { RequestGetAllEventsDto } from './dto/request-get-all-events.dto'
import { AddAttendeeToEventDto } from './dto/add-attendee-to-event.dto'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../guard/roles.guard'
import { Roles } from '../guard/roles.guard.decorator'
import { ADMIN_ROLE, USER_ROLE } from '../../common/constants'
import { TokenInterceptor } from './event-token.interceptor'
import { EventResponse } from './interfaces/event-response'

@ApiTags('conferences')
@Controller('v2/conferences')
export class ConferenceController {
  constructor(private readonly conferenceService: ConferenceService, private logger: Logger) {}

  @Get()
  @UseInterceptors(TokenInterceptor)
  @HttpCode(200)
  async getAll(@Query() params: RequestGetAllEventsDto): Promise<EventResponse[]> {
    this.logger.log('Get all conferences controller')
    return this.conferenceService.getAll()
  }
}
