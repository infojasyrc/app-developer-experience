import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { User } from '../../modules/users/user.entity'
import { Headquarter } from '../../modules/headquarter/headquarter.entity'
import { Conference } from '../../modules/conferences/conference.entity'
import { SEED_USERS, SEED_HEADQUARTERS, SEED_CONFERENCES } from './seed.data'

@Injectable()
export class ClearService {
  constructor(
    @InjectModel(User.name)        private readonly userModel: Model<User>,
    @InjectModel(Headquarter.name) private readonly headquarterModel: Model<Headquarter>,
    @InjectModel(Conference.name)  private readonly conferenceModel: Model<Conference>,
    private readonly logger: Logger,
  ) {}

  async run(): Promise<void> {
    this.logger.log('=== Clear started ===')
    // Conferences reference headquarters — delete them first
    await this.clearConferences()
    await this.clearHeadquarters()
    await this.clearUsers()
    this.logger.log('=== Clear complete ===')
  }

  private async clearConferences(): Promise<void> {
    const names = SEED_CONFERENCES.map(c => c.name)
    this.logger.log(`Clearing ${names.length} conferences`)
    const { deletedCount } = await this.conferenceModel.deleteMany({ name: { $in: names } })
    this.logger.log(`  ✓ ${deletedCount} conference(s) removed`)
  }

  private async clearHeadquarters(): Promise<void> {
    const cities = SEED_HEADQUARTERS.map(h => h.city)
    this.logger.log(`Clearing ${cities.length} headquarters`)
    const { deletedCount } = await this.headquarterModel.deleteMany({ city: { $in: cities } })
    this.logger.log(`  ✓ ${deletedCount} headquarter(s) removed`)
  }

  private async clearUsers(): Promise<void> {
    const uids = SEED_USERS.map(u => u.uid)
    this.logger.log(`Clearing ${uids.length} users`)
    const { deletedCount } = await this.userModel.deleteMany({ uid: { $in: uids } })
    this.logger.log(`  ✓ ${deletedCount} user(s) removed`)
  }
}
