import { Model } from 'mongoose'
import { Headquarter } from './headquarter.entity'
import { Conference } from '../conferences/conference.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Injectable, Logger } from '@nestjs/common'
import { HeadquarterResponse } from './interfaces/headquarter-response'
import HeadquarterMapper from './headquarter.mapper'
import { NotFoundException } from '../../exceptions/NotFound.exception'
import { BadRequestException } from '../../exceptions/BadRequest'
import { CreateHeadquarterDto } from './dto/create-headquarter.dto'
import { UpdateHeadquarterDto } from './dto/update-headquarter.dto'

@Injectable()
export class HeadquarterService {
  constructor(
    @InjectModel(Headquarter.name)
    private readonly headquarterModel: Model<Headquarter>,
    @InjectModel(Conference.name)
    private readonly conferenceModel: Model<Conference>,
    private logger: Logger
  ) {}

  async create(dto: CreateHeadquarterDto): Promise<HeadquarterResponse> {
    this.logger.log('Create headquarter service')
    const existing = await this.headquarterModel.findOne({ city: dto.city, country: dto.country })
    if (existing)
      throw new BadRequestException(`A headquarter in ${dto.city}, ${dto.country} already exists`)
    const created = await this.headquarterModel.create(HeadquarterMapper.createHeadquarterMapper(dto))
    return HeadquarterMapper.toResponse(created)
  }

  async getAll(): Promise<HeadquarterResponse[]> {
    this.logger.log('Get all service headquarter')
    const headquarters = await this.headquarterModel.find().exec()
    return HeadquarterMapper.toResponseList(headquarters)
  }

  async getById(headquarterId: string): Promise<HeadquarterResponse> {
    this.logger.log(`Get headquarter with id: ${headquarterId} service`)
    const headquarterById = await this.headquarterModel.findById(headquarterId)
    if (!headquarterById)
      throw new NotFoundException(
        `Error at get headquarter by id service, _id: ${headquarterId} was not found`
      )
    return HeadquarterMapper.toResponse(headquarterById)
  }

  async update(headquarterId: string, dto: UpdateHeadquarterDto): Promise<HeadquarterResponse> {
    this.logger.log(`Update headquarter id: ${headquarterId} service`)
    const mapped = HeadquarterMapper.updateHeadquarterMapper(dto)
    const updated = await this.headquarterModel
      .findOneAndUpdate({ _id: headquarterId }, mapped, { new: true })
      .exec()
    if (!updated)
      throw new NotFoundException(
        `Error at update headquarter service, _id: ${headquarterId} was not found`
      )
    return HeadquarterMapper.toResponse(updated)
  }

  async delete(headquarterId: string): Promise<void> {
    this.logger.log(`Delete headquarter id: ${headquarterId} service`)
    const headquarterById = await this.headquarterModel.findById(headquarterId)
    if (!headquarterById)
      throw new NotFoundException(
        `Error at delete headquarter service, _id: ${headquarterId} was not found`
      )
    const linkedConferences = await this.conferenceModel.countDocuments({ headquarter: headquarterId })
    if (linkedConferences > 0)
      throw new BadRequestException(
        `Cannot delete headquarter with id: ${headquarterId}, it has ${linkedConferences} conference(s) linked to it`
      )
    await this.headquarterModel.findByIdAndDelete(headquarterId)
  }
}
