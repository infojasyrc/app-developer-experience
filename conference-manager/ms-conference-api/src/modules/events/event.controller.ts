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

import { CreateEventDto } from './dto/create-event.dto'
import { EventService } from './event.service'
import { UpdateEventDto } from './dto/update-event.dto'
import { RequestGetAllEventsDto } from './dto/request-get-all-events.dto'
import { AddAttendeeToEventDto } from './dto/add-attendee-to-event.dto'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../guard/roles.guard'
import { Roles } from '../guard/roles.guard.decorator'
import { ADMIN_ROLE, USER_ROLE } from '../../common/constants'
import { EventIdDto } from './dto/event-id.dto'
import { UserIdDto } from './dto/user-id.dto'
import { TokenInterceptor } from './event-token.interceptor'
import { ImageUploadInterceptor } from './interceptors/image-upload.interceptor'
import { EventResponse } from './interfaces/event-response'
import { CreateEventSwaggerDecorator } from '../../infrastructure/swagger/v2/create-event.decorator'
import { UpdateEventSwaggerDecorator } from '../../infrastructure/swagger/v2/update-event.decorator'
import { ListEventsSwaggerDecorator } from '../../infrastructure/swagger/v2/list-events.decorator'
import { GetEventByIdSwaggerDecorator } from '../../infrastructure/swagger/v2/get-event-by-id.decorator'
import { AddAttendeeToEventSwaggerDecorator } from '../../infrastructure/swagger/v2/add-attendee-to-event.decorator'

@ApiTags('events')
@Controller('v2/events')
export class EventController {
  constructor(private readonly eventService: EventService, private logger: Logger) {}

  @Post()
  @CreateEventSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(ImageUploadInterceptor)
  @HttpCode(201)
  async create(@Body() event: CreateEventDto): Promise<EventResponse> {
    this.logger.log('Create event controller')
    return this.eventService.create(event)
  }

  @Put('/:eventId')
  @UpdateEventSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(200)
  async update(
    @Param('eventId') eventId: EventIdDto,
    @Body() event: UpdateEventDto
  ): Promise<EventResponse> {
    this.logger.log('Update event controller')
    return this.eventService.update(eventId, event)
  }

  @Get()
  @UseInterceptors(TokenInterceptor)
  @HttpCode(200)
  async getAll(@Query() params: RequestGetAllEventsDto): Promise<EventResponse[]> {
    this.logger.log('Get all events controller')
    return this.eventService.getAll(params)
  }

  @Get('/:eventId')
  @GetEventByIdSwaggerDecorator()
  @HttpCode(200)
  async getById(@Param('eventId') eventId: EventIdDto): Promise<EventResponse> {
    this.logger.log(`Get event with id: ${eventId} controller`)
    return this.eventService.getById(eventId)
  }

  @Post('/:eventId/attendee/:userId')
  @AddAttendeeToEventSwaggerDecorator()
  @Roles(ADMIN_ROLE, USER_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(200)
  async addAttendeeToEvent(
    @Param('eventId') eventId: EventIdDto,
    @Param('userId') userId: UserIdDto,
    @Body() attendeeData: AddAttendeeToEventDto
  ): Promise<EventResponse> {
    this.logger.log(`Add attendee ${userId} to event id: ${eventId} at service`)
    return this.eventService.addAttendeeToEvent(eventId, userId, attendeeData)
  }
}
