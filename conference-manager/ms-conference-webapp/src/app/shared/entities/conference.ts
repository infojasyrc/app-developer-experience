import { ImageMediaType } from './media'
import { Headquarter } from './headquarter'

export type ConferenceStatus =
  | 'created'
  | 'opened'
  | 'paused'
  | 'closed'
  | 'active'
  | 'inactive'

export interface Conference {
  _id: string
  name: string
  description: string
  eventDate: string
  status: ConferenceStatus
  /** API field name is `type`; matches v2 schema */
  type: string
  phoneNumber?: string
  address?: string
  year?: string
  owner?: string
  images?: string[] | ImageMediaType[]
  headquarter?: Headquarter
  subscribed?: boolean
  /** Comma-separated string as returned by the v2 API */
  tags?: string
  attendees?: string[]
}

export interface ConferenceFilters {
  year: string
  sortBy: string
}

export interface DataValidation {
  error: boolean
  message?: string
}

export interface ConferenceDataValidation {
  name: DataValidation
  eventDate: DataValidation
}
