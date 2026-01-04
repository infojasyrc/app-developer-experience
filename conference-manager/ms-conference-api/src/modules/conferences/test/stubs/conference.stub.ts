import { Types } from 'mongoose'
import { Conference } from '../../conference.entity'
import { ConferenceStatus } from '../../conference.enum'

const generateMockId = () => new Types.ObjectId().toHexString()

export const CONFERENCE_ID_MOCK = new Types.ObjectId('65c516a7eae2b91375ecba6e').toHexString()
export const USER_ID_MOCK = new Types.ObjectId('65a9ae1f615ad496533cde52')
export const MOCK_HEADQUARTER = {
  _id: new Types.ObjectId('654d4ac398b7a0abaa3c3a40'),
  name: 'Panamá',
}
export const MOCK_OWNER = '2qWPHHeRY9b3ouN8deae8GkCUnx1'

export const CONFERENCE_MOCK: Conference = {
  _id: CONFERENCE_ID_MOCK,
  name: 'Storm',
  eventDate: new Date('2023-11-21T19:00:00.000'),
  owner: '2qWPHHeRY9b3ouN8deae8GkCUnx1',
  type: 'Recruiting',
  tags: 'Architecture',
  headquarter: MOCK_HEADQUARTER,
  description: 'A description',
  address: '2323 El Dorado Avenue',
  attendees: [USER_ID_MOCK],
  status: ConferenceStatus.ACTIVE,
  year: '2024',
}

/**
 * Get a mock event
 * @param eventStatusExpected - The expected status of the event
 * @returns A mock event
 * @example
 * const event = getMockEvent('ACTIVE')
 * @example
 * const event = getMockEvent('INACTIVE')
 * @example
 * const event = getMockEvent('CREATED')
 * @example
 * const event = getMockEvent(undefined)
 **/
const getMockConference = (eventStatusExpected: string | undefined) => {
  const eventRandomName = Math.floor(Math.random() * 100)
  const eventDate = new Date('2024-11-21T19:00:00.000')
  const eventStatusList = [ConferenceStatus.ACTIVE, ConferenceStatus.CREATED, ConferenceStatus.INACTIVE]
  const eventStatusRandom = eventStatusList[Math.floor(Math.random() * eventStatusList.length)]
  const eventStatus = eventStatusExpected ? eventStatusExpected : eventStatusRandom
  return {
    _id: generateMockId(),
    eventDate: eventDate,
    tags: 'Design',
    name: `Linux Summit ${eventRandomName} Day`,
    year: '2024',
    type: 'Sales',
    owner: 'asif',
    status: eventStatus,
    address: '120 Main Street',
    description: 'A description',
    headquarter: MOCK_HEADQUARTER,
  }
}

/**
 * Get a list of mock
 * @param eventStatus - The status of the events
 * @returns A list of mock events
 * @example
 * const events = getMockList('ACTIVE')
 * @example
 * const events = getMockList('INACTIVE')
 * @example
 * const events = getMockList('CREATED')
 * @example
 * const events = getMockList(undefined)
 **/
export const getMockList = (eventStatus: string | undefined) => {
  const listWithStatus = [
    getMockConference(eventStatus),
    getMockConference(eventStatus),
    getMockConference(eventStatus)
  ]
  const listWithoutStatus = [
    getMockConference(undefined),
    getMockConference(undefined),
    getMockConference(undefined)
  ]
  const eventList = eventStatus ? listWithStatus : listWithoutStatus
  return eventList
}

export const LIST_ACTIVE_MOCK: Conference[] = [
  {
    _id: generateMockId(),
    eventDate: new Date('2024-11-21T19:00:00.000'),
    tags: 'Servers',
    name: 'Ubuntu Conf',
    year: '2024',
    type: 'Sales',
    owner: 'asif',
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
    owner: 'asif',
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
    owner: 'asif',
    status: ConferenceStatus.ACTIVE,
    address: '85 Salvio Street',
    description: 'A description',
    headquarter: MOCK_HEADQUARTER,
  },
]
