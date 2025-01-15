import { Model } from 'mongoose'
import { Headquarter } from './headquarter.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Injectable, Logger } from '@nestjs/common'
import { HeadquarterResponse } from './interfaces/headquarter-response'
import HeadquarterMapper from './headquarter.mapper'
import { ChupitosNotFoundException } from '../../exceptions/chupitos-not-found.exception'

@Injectable()
export class HeadquarterService {
  constructor(
    @InjectModel(Headquarter.name)
    private readonly headquarterModel: Model<Headquarter>,
    private logger: Logger
  ) {}

  async getAll(): Promise<HeadquarterResponse[]> {
    this.logger.log('Get all service headquarter')

    return await this.headquarterModel.find()
  }

  async getById(headquarterId: string): Promise<HeadquarterResponse> {
    this.logger.log(`Get headquarter with id: ${headquarterId} service`)
    const headquarterById = await this.headquarterModel.findById(headquarterId)

    if (!headquarterById)
      throw new ChupitosNotFoundException(
        `Error at get headquarter by id service, _id: ${headquarterById} was not found`
      )
    return headquarterById
  }
}
