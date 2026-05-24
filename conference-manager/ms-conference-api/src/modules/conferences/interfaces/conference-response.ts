import { Types } from 'mongoose'
import { Headquarter } from '../../headquarter/headquarter.entity'

export interface ConferenceResponse {
  _id: string
  eventDate: Date
  tags: string
  name: string
  year: string
  type: string
  owner: string
  status: string
  address: string
  description: string
  headquarter: Headquarter
  attendees?: Types.ObjectId[]
}
