import { CreateUserDto } from '../../modules/users/dto/create-user.dto'
import { CreateHeadquarterDto } from '../../modules/headquarter/dto/create-headquarter.dto'
import { CreateConferenceDto } from '../../modules/conferences/dto/create-conference.dto'

// UID used as `createdBy` on every seeded conference
export const SEED_ADMIN_UID = '2qWPHHeRY9b3ouN8deae8GkCUnx1'

export const SEED_USERS: CreateUserDto[] = [
  {
    uid: 'sRrmUhxMgrhA1WeMyQp9CzzxyO92',
    firstName: 'User',
    lastName: 'App',
    email: 'testuser@hakoopro.com',
    createdBy: SEED_ADMIN_UID,
  },
  {
    uid: SEED_ADMIN_UID,
    firstName: 'User',
    lastName: 'Admin',
    email: 'adminuser@hakoopro.com',
    createdBy: SEED_ADMIN_UID,
  },
]

export const SEED_HEADQUARTERS: CreateHeadquarterDto[] = [
  { city: 'Bogota',      country: 'Colombia', createdBy: SEED_ADMIN_UID },
  { city: 'Panama City', country: 'Panama',   createdBy: SEED_ADMIN_UID },
  { city: 'Lima',        country: 'Peru',     createdBy: SEED_ADMIN_UID },
  { city: 'California',  country: 'USA',     createdBy: SEED_ADMIN_UID },
  { city: 'New York',    country: 'USA',     createdBy: SEED_ADMIN_UID },
  { city: 'Washington',  country: 'USA',     createdBy: SEED_ADMIN_UID },
  { city: 'Paris',       country: 'France',   createdBy: SEED_ADMIN_UID },
]

// `headquarter` is injected at seed time; `image` is omitted (no file upload during seeding)
export type SeedConferenceFixture = Omit<CreateConferenceDto, 'headquarter' | 'image'>

export const SEED_CONFERENCES: SeedConferenceFixture[] = [
  {
    name: 'Google IO',
    description: 'The annual Google developer conference covering Android, Cloud, and Web.',
    eventDate: new Date('2026-05-08'),
    type: 'Sales',
    tags: 'Android,Cloud,Web',
    address: 'Shoreline Amphitheatre, Mountain View, CA',
    createdBy: SEED_ADMIN_UID,
  },
  {
    name: 'Apple WWDC',
    description: 'Apple Worldwide Developers Conference showcasing iOS, macOS, and Swift.',
    eventDate: new Date('2026-06-08'),
    type: 'Sales',
    tags: 'iOS,macOS,Swift',
    address: 'Apple Park, Cupertino, CA',
    createdBy: SEED_ADMIN_UID,
  },
  {
    name: 'AWS Summit',
    description: 'Amazon Web Services Summit on cloud, DevOps, and infrastructure.',
    eventDate: new Date('2026-11-08'),
    type: 'Sales',
    tags: 'Cloud,DevOps,Infrastructure',
    address: 'Walter E. Washington Convention Center, Washington DC',
    createdBy: SEED_ADMIN_UID,
  },
  {
    name: 'Mobile World Congress',
    description: 'Global mobile industry exhibition covering connectivity and innovation.',
    eventDate: new Date('2026-02-04'),
    type: 'Sales',
    tags: 'Mobile,Connectivity,Innovation',
    address: 'Fira Gran Via, Barcelona, Spain',
    createdBy: SEED_ADMIN_UID,
  },
  {
    name: 'Black Hat',
    description: 'Leading information security conference for cybersecurity professionals.',
    eventDate: new Date('2026-08-18'),
    type: 'Sales',
    tags: 'Security,Hacking,CyberSecurity',
    address: 'Mandalay Bay Convention Center, Las Vegas, NV',
    createdBy: SEED_ADMIN_UID,
  },
  {
    name: 'Firebase Summit',
    description: 'Firebase developer summit covering mobile and backend development.',
    eventDate: new Date('2026-10-18'),
    type: 'Sales',
    tags: 'Firebase,Mobile,Backend',
    address: 'Online',
    createdBy: SEED_ADMIN_UID,
  },
]
