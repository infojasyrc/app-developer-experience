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
  eventType: string
  phoneNumber?: string
  address?: string
  year?: number
  images?: ImageMediaType[]
  headquarter?: Headquarter
  subscribed?: boolean
  tags?: string[]
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
