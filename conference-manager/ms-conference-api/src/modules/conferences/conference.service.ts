import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { Conference } from './conference.entity'
import { ConferenceStatus } from './conference.enum'
import ConferenceMapper from './conference.mapper'
import { ConferenceResponse } from './interfaces/conference-response'
import { CreateConferenceDto } from './dto/create-conference.dto'
import { UpdateConferenceDto } from './dto/update-conference.dto'
import { UpdateConferenceStatusDto } from './dto/update-conference-status.dto'
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
    attendeeId: string,
    attendeeData: AddAttendeeToConferenceDto,
  ): Promise<ConferenceResponse> {
    this.logger.log(`Add attendee ${attendeeId} to conference id: ${conferenceId} service`)
    const conference = await this.conferenceModel.findById(conferenceId)
    if (!conference)
      throw new NotFoundException(
        `Error at add attendee to conference service, conference _id: ${conferenceId} was not found`,
      )
    this.validateConferenceStatus(conferenceId, conference)
    this.validateUserAlreadyAttending(conference, conferenceId, attendeeId)
    conference.attendees = conference.attendees ?? []
    conference.attendees.push(new Types.ObjectId(String(attendeeId)))
    return conference.save()
  }

  async updateStatus(conferenceId: string, dto: UpdateConferenceStatusDto): Promise<ConferenceResponse> {
    this.logger.log(`Update conference status id: ${conferenceId} service`)
    const updated = await this.conferenceModel.findByIdAndUpdate(
      conferenceId,
      { status: dto.status, updatedBy: dto.updatedBy },
      { new: true },
    )
    if (!updated)
      throw new NotFoundException(`Conference with id: ${conferenceId} was not found`)
    return updated
  }

  async uploadImage(conferenceId: string, file: Express.Multer.File): Promise<ConferenceResponse> {
    this.logger.log(`Upload image to conference id: ${conferenceId} service`)
    const conference = await this.conferenceModel.findById(conferenceId)
    if (!conference)
      throw new NotFoundException(`Conference with id: ${conferenceId} was not found`)
    this.validateConferenceImage(file)
    const url = await this.firebaseUploadService.uploadFile(file)
    conference.images = [...(conference.images ?? []), url]
    return conference.save()
  }

  async deleteImage(conferenceId: string, filename: string): Promise<void> {
    this.logger.log(`Delete image ${filename} from conference id: ${conferenceId} service`)
    const conference = await this.conferenceModel.findById(conferenceId)
    if (!conference)
      throw new NotFoundException(`Conference with id: ${conferenceId} was not found`)
    await this.firebaseUploadService.deleteFile(filename)
    conference.images = (conference.images ?? []).filter(img => !img.includes(filename))
    await conference.save()
  }

  async exportAttendeesAsCsv(conferenceId: string): Promise<string> {
    this.logger.log(`Export attendees CSV for conference id: ${conferenceId} service`)
    const conference = await this.conferenceModel.findById(conferenceId).populate('attendees')
    if (!conference)
      throw new NotFoundException(`Conference with id: ${conferenceId} was not found`)
    const headers = ['uid', 'firstName', 'lastName', 'email']
    const rows = (conference.attendees ?? []).map((user: any) =>
      [user.uid, user.firstName, user.lastName, user.email]
        .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    return [headers.join(','), ...rows].join('\n')
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
    attendeeId: string,
  ): void {
    const attendees = conference.attendees ?? []
    const attendeeObjectId = new Types.ObjectId(String(attendeeId))
    if (attendees.some(id => id.equals(attendeeObjectId)))
      throw new BadRequestException(
        `User with id: ${attendeeId} is already attending conference: ${conferenceId}`,
      )
  }
}
