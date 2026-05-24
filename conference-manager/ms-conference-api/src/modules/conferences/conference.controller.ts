import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'

import { ConferenceService } from './conference.service'
import { ConferenceResponse } from './interfaces/conference-response'
import { CreateConferenceDto } from './dto/create-conference.dto'
import { UpdateConferenceDto } from './dto/update-conference.dto'
import { UpdateConferenceStatusDto } from './dto/update-conference-status.dto'
import { ConferenceIdDto } from './dto/conference-id.dto'
import { AddAttendeeToConferenceDto } from './dto/add-attendee-to-conference.dto'
import { RequestGetAllConferencesDto } from './dto/request-get-all-conferences.dto'
import { RolesGuard } from '../guard/roles.guard'
import { Roles } from '../guard/roles.guard.decorator'
import { ADMIN_ROLE, USER_ROLE } from '../../common/constants'
import { ImageUploadInterceptor } from './interceptors/image-upload.interceptor'
import { CreateConferenceSwaggerDecorator } from '../../infrastructure/swagger/v2/create-conference.decorator'
import { UpdateConferenceSwaggerDecorator } from '../../infrastructure/swagger/v2/update-conference.decorator'
import { GetConferenceByIdSwaggerDecorator } from '../../infrastructure/swagger/v2/get-conference-by-id.decorator'
import { DeleteConferenceSwaggerDecorator } from '../../infrastructure/swagger/v2/delete-conference.decorator'
import { ListConferencesSwaggerDecorator } from '../../infrastructure/swagger/v2/list-conferences.decorator'
import { AddAttendeeToConferenceSwaggerDecorator } from '../../infrastructure/swagger/v2/add-attendee-to-conference.decorator'
import { UpdateConferenceStatusSwaggerDecorator } from '../../infrastructure/swagger/v2/update-conference-status.decorator'
import { UploadConferenceImageSwaggerDecorator } from '../../infrastructure/swagger/v2/upload-conference-image.decorator'
import { DeleteConferenceImageSwaggerDecorator } from '../../infrastructure/swagger/v2/delete-conference-image.decorator'
import { ExportConferenceAttendeesSwaggerDecorator } from '../../infrastructure/swagger/v2/export-conference-attendees.decorator'

@ApiTags('conferences')
@Controller('v2/conferences')
export class ConferenceController {
  constructor(
    private readonly conferenceService: ConferenceService,
    private readonly logger: Logger,
  ) {}

  @Post()
  @CreateConferenceSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(ImageUploadInterceptor)
  @HttpCode(201)
  async create(@Body() dto: CreateConferenceDto): Promise<ConferenceResponse> {
    this.logger.log('Create conference controller')
    return this.conferenceService.create(dto)
  }

  @Get()
  @ListConferencesSwaggerDecorator()
  @HttpCode(200)
  async getAll(@Query() params: RequestGetAllConferencesDto): Promise<ConferenceResponse[]> {
    this.logger.log('Get all conferences controller')
    return this.conferenceService.getAll(params)
  }

  @Get('/:conferenceId')
  @GetConferenceByIdSwaggerDecorator()
  @HttpCode(200)
  async getById(@Param('conferenceId') conferenceId: ConferenceIdDto): Promise<ConferenceResponse> {
    this.logger.log(`Get conference by id: ${conferenceId} controller`)
    return this.conferenceService.getById(conferenceId)
  }

  @Put('/:conferenceId')
  @UpdateConferenceSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(200)
  async update(
    @Param('conferenceId') conferenceId: ConferenceIdDto,
    @Body() dto: UpdateConferenceDto,
  ): Promise<ConferenceResponse> {
    this.logger.log('Update conference controller')
    return this.conferenceService.update(conferenceId, dto)
  }

  @Delete('/:conferenceId')
  @DeleteConferenceSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(204)
  async delete(@Param('conferenceId') conferenceId: ConferenceIdDto): Promise<void> {
    this.logger.log(`Delete conference id: ${conferenceId} controller`)
    return this.conferenceService.delete(conferenceId)
  }

  @Post('/:conferenceId/attendee/:userId')
  @AddAttendeeToConferenceSwaggerDecorator()
  @Roles(ADMIN_ROLE, USER_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(200)
  async addAttendeeToConference(
    @Param('conferenceId') conferenceId: ConferenceIdDto,
    @Param('userId') userId: string,
    @Body() attendeeData: AddAttendeeToConferenceDto,
  ): Promise<ConferenceResponse> {
    this.logger.log(`Add attendee ${userId} to conference id: ${conferenceId} controller`)
    return this.conferenceService.addAttendeeToConference(conferenceId, userId, attendeeData)
  }

  @Put('/:conferenceId/status')
  @UpdateConferenceStatusSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(200)
  async updateStatus(
    @Param('conferenceId') conferenceId: string,
    @Body() dto: UpdateConferenceStatusDto,
  ): Promise<ConferenceResponse> {
    this.logger.log(`Update conference status id: ${conferenceId} controller`)
    return this.conferenceService.updateStatus(conferenceId, dto)
  }

  @Post('/:conferenceId/images')
  @UploadConferenceImageSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(ImageUploadInterceptor)
  @HttpCode(200)
  async uploadImage(
    @Param('conferenceId') conferenceId: string,
    @Body() body: Record<string, any>,
  ): Promise<ConferenceResponse> {
    this.logger.log(`Upload image to conference id: ${conferenceId} controller`)
    return this.conferenceService.uploadImage(conferenceId, body.image)
  }

  @Delete('/:conferenceId/images/:imageId')
  @DeleteConferenceImageSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @HttpCode(204)
  async deleteImage(
    @Param('conferenceId') conferenceId: string,
    @Param('imageId') imageId: string,
  ): Promise<void> {
    this.logger.log(`Delete image ${imageId} from conference id: ${conferenceId} controller`)
    return this.conferenceService.deleteImage(conferenceId, decodeURIComponent(imageId))
  }

  @Get('/:conferenceId/attendees/export')
  @ExportConferenceAttendeesSwaggerDecorator()
  @Roles(ADMIN_ROLE)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async exportAttendees(
    @Param('conferenceId') conferenceId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    this.logger.log(`Export attendees for conference id: ${conferenceId} controller`)
    const csv = await this.conferenceService.exportAttendeesAsCsv(conferenceId)
    res.set('Content-Type', 'text/csv')
    res.set('Content-Disposition', `attachment; filename="conference-${conferenceId}-attendees.csv"`)
    return csv
  }
}
