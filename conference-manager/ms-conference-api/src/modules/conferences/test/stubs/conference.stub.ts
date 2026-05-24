import { Types } from 'mongoose'
import { Conference } from '../../conference.entity'
import { ConferenceStatus } from '../../conference.enum'
import { CreateConferenceDto } from '../../dto/create-conference.dto'
import { UpdateConferenceDto } from '../../dto/update-conference.dto'
import { UpdateConferenceStatusDto } from '../../dto/update-conference-status.dto'
import { AddAttendeeToConferenceDto } from '../../dto/add-attendee-to-conference.dto'

const generateMockId = () => new Types.ObjectId().toHexString()

export const CONFERENCE_ID_MOCK = new Types.ObjectId('65c516a7eae2b91375ecba6e')
export const USER_ID_MOCK = new Types.ObjectId('65a9ae1f615ad496533cde52')
export const MOCK_HEADQUARTER = {
  _id: '654d4ac398b7a0abaa3c3a40',
  name: 'Panamá',
}
export const MOCK_OWNER = '2qWPHHeRY9b3ouN8deae8GkCUnx1'

export const CONFERENCE_MOCK: Conference = {
  _id: CONFERENCE_ID_MOCK.toHexString(),
  name: 'Storm',
  eventDate: new Date('2023-11-21T19:00:00.000'),
  owner: MOCK_OWNER,
  type: 'Recruiting',
  tags: 'Architecture',
  headquarter: MOCK_HEADQUARTER,
  description: 'A description',
  address: '2323 El Dorado Avenue',
  attendees: [USER_ID_MOCK],
  status: ConferenceStatus.ACTIVE,
  year: '2024',
}

export const CREATE_CONFERENCE_MOCK_DTO: CreateConferenceDto = {
  name: 'Storm',
  eventDate: new Date('2024-11-21T19:00:00.000'),
  type: 'Recruiting',
  tags: 'Architecture',
  headquarter: MOCK_HEADQUARTER,
  description: 'A description',
  userId: MOCK_OWNER,
  address: '2323 El Dorado Avenue',
}

export const UPDATE_CONFERENCE_MOCK_DTO: UpdateConferenceDto = {
  description: 'Updated description',
  address: 'Updated Address',
}

export const UPDATE_CONFERENCE_STATUS_MOCK_DTO: UpdateConferenceDto = {
  eventDate: new Date('2024-11-21T19:00:00.000'),
  status: ConferenceStatus.ACTIVE,
  year: '2024',
}

export const ADD_ATTENDEE_MOCK_DTO: AddAttendeeToConferenceDto = {
  name: 'User',
  lastName: 'App',
  email: 'testuser@conference.com',
}

const getMockConference = (statusExpected: string | undefined) => {
  const randomName = Math.floor(Math.random() * 100)
  const eventDate = new Date('2024-11-21T19:00:00.000')
  const statusList = [ConferenceStatus.ACTIVE, ConferenceStatus.CREATED, ConferenceStatus.INACTIVE]
  const randomStatus = statusList[Math.floor(Math.random() * statusList.length)]
  const status = statusExpected ?? randomStatus
  return {
    _id: generateMockId(),
    eventDate,
    tags: 'Design',
    name: `Linux Summit ${randomName} Day`,
    year: '2024',
    type: 'Sales',
    owner: MOCK_OWNER,
    status,
    address: '120 Main Street',
    description: 'A description',
    headquarter: MOCK_HEADQUARTER,
  }
}

export const getMockList = (status: string | undefined) => [
  getMockConference(status),
  getMockConference(status),
  getMockConference(status),
]

export const UPDATE_CONFERENCE_STATUS_DTO_MOCK: UpdateConferenceStatusDto = {
  status: ConferenceStatus.ACTIVE,
}

export const MOCK_CONFERENCE_IMAGE_FILE: Express.Multer.File = {
  fieldname: 'image',
  originalname: 'conf.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('fake-image-data'),
  size: 1024,
  stream: null as any,
  destination: '',
  filename: 'conf.jpg',
  path: '',
}

export const MOCK_CONFERENCE_IMAGE_URL = 'https://storage.googleapis.com/bucket/1234567890-conf.jpg'
export const MOCK_CONFERENCE_IMAGE_FILENAME = '1234567890-conf.jpg'

export const LIST_ACTIVE_MOCK: Conference[] = [
  {
    _id: generateMockId(),
    eventDate: new Date('2024-11-21T19:00:00.000'),
    tags: 'Servers',
    name: 'Ubuntu Conf',
    year: '2024',
    type: 'Sales',
    owner: MOCK_OWNER,
    status: ConferenceStatus.ACTIVE,
    address: '85 Salvio Street',
    description: 'A description',
    headquarter: MOCK_HEADQUARTER,
  },
  {
    _id: generateMockId(),
    eventDate: new Date('2023-11-22T19:00:00.000'),
    tags: 'DevOps',
    name: 'KuberConf',
    year: '2022',
    type: 'Sales',
    owner: MOCK_OWNER,
    status: ConferenceStatus.ACTIVE,
    address: '85 Salvio Street',
    description: 'A description',
    headquarter: MOCK_HEADQUARTER,
  },
  {
    _id: generateMockId(),
    eventDate: new Date('2024-11-21T19:00:00.000'),
    tags: 'OpenSource',
    name: 'Linux Summit',
    year: '2024',
    type: 'Sales',
    owner: MOCK_OWNER,
    status: ConferenceStatus.ACTIVE,
    address: '85 Salvio Street',
    description: 'A description',
    headquarter: MOCK_HEADQUARTER,
  },
]
