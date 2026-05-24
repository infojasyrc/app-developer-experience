import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { Conference } from './conference.entity'
import { ConferenceStatus } from './conference.enum'
import ConferenceMapper from './conference.mapper'
import { ConferenceResponse } from './interfaces/conference-response'
import { CreateConferenceDto } from './dto/create-conference.dto'
import { UpdateConferenceDto } from './dto/update-conference.dto'
import { ConferenceIdDto } from './dto/conference-id.dto'
import { AddAttendeeToConferenceDto } from './dto/add-attendee-to-conference.dto'
import { RequestGetAllConferencesDto } from './dto/request-get-all-conferences.dto'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import { BadRequestException } from '../../exceptions/BadRequest'
import { FirebaseUploadService } from '../firebase-auth/firebase-upload-file.service'

@Injectable()
export class ConferenceService {
  constructor(
    @InjectModel(Conference.name)
    private readonly conferenceModel: Model<Conference>,
    private readonly logger: Logger,
    private readonly firebaseUploadService: FirebaseUploadService,
  ) {}

  async create(dto: CreateConferenceDto): Promise<ConferenceResponse> {
    this.logger.log('Create conference service')
    const conference = ConferenceMapper.createConferenceMapper(dto)
    await this.validateConferenceNameAlreadyExisting(conference.name)
    if (dto.image) {
      this.validateConferenceImage(dto.image)
      await this.getFirebaseUploadedImageUrl(dto.image, conference)
    }
    return this.conferenceModel.create(conference)
  }

  async getAll(params: RequestGetAllConferencesDto): Promise<ConferenceResponse[]> {
    this.logger.log('Get all conferences service')
    const query = ConferenceMapper.getAllMapper(params)
    return this.conferenceModel.find(query).exec()
  }

  async getById(conferenceId: ConferenceIdDto): Promise<ConferenceResponse> {
    this.logger.log(`Get conference by id: ${conferenceId} service`)
    const conference = await this.conferenceModel.findById(conferenceId)
    if (!conference)
      throw new NotFoundException(`Error at get conference by id service, _id: ${conferenceId} was not found`)
    return conference
  }

  async update(conferenceId: ConferenceIdDto, dto: UpdateConferenceDto): Promise<ConferenceResponse> {
    this.logger.log('Update conference service')
    const mapped = ConferenceMapper.updateConferenceMapper(dto)
    const updated = await this.conferenceModel
      .findOneAndUpdate({ _id: conferenceId }, mapped, { new: true })
      .exec()
    if (!updated)
      throw new NotFoundException(`Error at update conference service, _id: ${conferenceId} was not found`)
    return updated
  }

  async delete(conferenceId: ConferenceIdDto): Promise<void> {
    this.logger.log(`Delete conference id: ${conferenceId} service`)
    const conference = await this.conferenceModel
      .findOneAndUpdate({ _id: conferenceId }, { status: ConferenceStatus.INACTIVE }, { new: true })
      .exec()
    if (!conference)
      throw new NotFoundException(`Error at delete conference service, _id: ${conferenceId} was not found`)
  }

  async addAttendeeToConference(
    conferenceId: ConferenceIdDto,
    userId: string,
    attendeeData: AddAttendeeToConferenceDto,
  ): Promise<ConferenceResponse> {
    this.logger.log(`Add attendee ${userId} to conference id: ${conferenceId} service`)
    const conference = await this.conferenceModel.findById(conferenceId)
    if (!conference)
      throw new NotFoundException(
        `Error at add attendee to conference service, conference _id: ${conferenceId} was not found`,
      )
    this.validateConferenceStatus(conferenceId, conference)
    this.validateUserAlreadyAttending(conference, conferenceId, userId)
    conference.attendees = conference.attendees ?? []
    conference.attendees.push(new Types.ObjectId(String(userId)))
    return conference.save()
  }

  async getFirebaseUploadedImageUrl(file: Express.Multer.File, conference: Conference): Promise<Conference> {
    try {
      const url = await this.firebaseUploadService.uploadFile(file)
      conference.images = [url]
      return conference
    } catch (error) {
      this.logger.error('Error at conference service, get firebase uploaded image url', error)
      return conference
    }
  }

  validateConferenceImage(image: Express.Multer.File): void {
    if (!image.mimetype.startsWith('image/jpeg'))
      throw new BadRequestException('Only JPG images are allowed')
  }

  private async validateConferenceNameAlreadyExisting(name: string): Promise<void> {
    const existing = await this.conferenceModel.findOne({ name })
    if (existing)
      throw new BadRequestException(`The conference with name: ${name}, already exists`)
  }

  private validateConferenceStatus(conferenceId: ConferenceIdDto, conference: Conference): void {
    if (conference.status !== ConferenceStatus.ACTIVE)
      throw new BadRequestException(
        `Conference with id: ${conferenceId} cannot accept attendees because it is not active`,
      )
  }

  private validateUserAlreadyAttending(
    conference: Conference,
    conferenceId: ConferenceIdDto,
    userId: string,
  ): void {
    const attendees = conference.attendees ?? []
    const userObjectId = new Types.ObjectId(String(userId))
    if (attendees.some(id => id.equals(userObjectId)))
      throw new BadRequestException(
        `User with id: ${userId} is already attending conference: ${conferenceId}`,
      )
  }
}
