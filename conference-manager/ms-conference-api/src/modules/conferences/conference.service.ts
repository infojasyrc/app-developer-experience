import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Conference } from './conference.entity'
import ConferenceMapper from './conference.mapper'

@Injectable()
export class ConferenceService {
  constructor(
    @InjectModel(Event.name)
    private readonly conferenceModel: Model<Conference>,
    private logger: Logger,
  ) {}

  async getAll(): Promise<Conference[]> {
    this.logger.log('Get all conferences service')
    const query = ConferenceMapper.getAllMapper()

    const result = await this.conferenceModel.find(query).exec()
    return result
  }
}
