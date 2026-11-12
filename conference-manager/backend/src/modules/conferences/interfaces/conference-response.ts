import { Types } from 'mongoose'
import { Headquarter } from '../../headquarter/headquarter.entity'
import { AuditFields } from '../../../common/interfaces/audit-fields.interface'

export interface ConferenceResponse extends AuditFields {
  _id: string
  eventDate: Date
  tags: string
  name: string
  year: string
  type: string
  status: string
  address: string
  description: string
  headquarter: Headquarter
  attendees?: Types.ObjectId[]
  images?: string[]
}
