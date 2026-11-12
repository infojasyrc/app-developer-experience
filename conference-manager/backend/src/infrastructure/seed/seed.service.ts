import { Injectable, Logger } from '@nestjs/common'

import { UserService } from '../../modules/users/user.service'
import { HeadquarterService } from '../../modules/headquarter/headquarter.service'
import { ConferenceService } from '../../modules/conferences/conference.service'
import { ConferenceStatus } from '../../modules/conferences/conference.enum'
import { SEED_USERS, SEED_HEADQUARTERS, SEED_CONFERENCES, SEED_ADMIN_UID, SeedConferenceFixture } from './seed.data'
import { CreateConferenceDto } from '../../modules/conferences/dto/create-conference.dto'
import { Headquarter } from '../../modules/headquarter/headquarter.entity'

@Injectable()
export class SeedService {
  constructor(
    private readonly userService: UserService,
    private readonly headquarterService: HeadquarterService,
    private readonly conferenceService: ConferenceService,
    private readonly logger: Logger,
  ) {}

  async run(): Promise<void> {
    this.logger.log('=== Seed started ===')
    await this.seedUsers()
    const headquarterId = await this.seedHeadquarters()
    await this.seedConferences(headquarterId)
    this.logger.log('=== Seed complete ===')
  }

  private async seedUsers(): Promise<void> {
    this.logger.log(`Seeding ${SEED_USERS.length} users`)
    for (const dto of SEED_USERS) {
      try {
        await this.userService.create(dto)
        this.logger.log(`  ✓ created  ${dto.email}`)
      } catch (err: any) {
        if (this.isDuplicate(err)) {
          this.logger.log(`  ~ skipped  ${dto.email} (already exists)`)
        } else {
          this.logger.error(`  ✗ failed   ${dto.email}: ${err.message}`)
        }
      }
    }
  }

  private async seedHeadquarters(): Promise<string> {
    this.logger.log(`Seeding ${SEED_HEADQUARTERS.length} headquarters`)
    let firstId = ''

    for (const dto of SEED_HEADQUARTERS) {
      try {
        const hq = await this.headquarterService.create(dto)
        if (!firstId) firstId = hq._id
        this.logger.log(`  ✓ created  ${dto.city}, ${dto.country}`)
      } catch (err: any) {
        if (this.isDuplicate(err)) {
          this.logger.log(`  ~ skipped  ${dto.city}, ${dto.country} (already exists)`)
        } else {
          this.logger.error(`  ✗ failed   ${dto.city}, ${dto.country}: ${err.message}`)
        }
      }
    }

    // All already existed — fetch the first to get a valid ID for conference linking
    if (!firstId) {
      const all = await this.headquarterService.getAll()
      firstId = all[0]._id
    }

    return firstId
  }

  private async seedConferences(headquarterId: string): Promise<void> {
    this.logger.log(`Seeding ${SEED_CONFERENCES.length} conferences`)
    for (const fixture of SEED_CONFERENCES) {
      const dto = this.buildConferenceDto(fixture, headquarterId)
      try {
        const created = await this.conferenceService.create(dto)
        await this.conferenceService.updateStatus(created._id, {
          status: ConferenceStatus.ACTIVE,
          updatedBy: SEED_ADMIN_UID,
        })
        this.logger.log(`  ✓ created  ${fixture.name}`)
      } catch (err: any) {
        if (this.isDuplicate(err)) {
          this.logger.log(`  ~ skipped  ${fixture.name} (already exists)`)
        } else {
          this.logger.error(`  ✗ failed   ${fixture.name}: ${err.message}`)
        }
      }
    }
  }

  private buildConferenceDto(fixture: SeedConferenceFixture, headquarterId: string): CreateConferenceDto {
    return {
      ...fixture,
      headquarter: headquarterId as unknown as Headquarter,
    }
  }

  private isDuplicate(err: any): boolean {
    return String(err?.message ?? '').includes('already exists')
  }
}
