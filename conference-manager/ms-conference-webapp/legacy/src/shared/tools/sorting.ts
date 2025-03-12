import Moment from 'moment'

import { Conference } from '../entities/conference'

const customDateFormat: string = 'yyyy-MM-DDThh:mm:ss.SSS'

export const formatDateForComparison = (dateValue: string) => {
  return Moment(dateValue, customDateFormat)
}

export const sortDescending = (first: Conference, second: Conference) => {
  const firstMoment = formatDateForComparison(first.eventDate)
  const secondMoment = formatDateForComparison(second.eventDate)
  return firstMoment.isBefore(secondMoment) ? 1 : -1
}

export const sortAscending = (first: Conference, second: Conference) => {
  const firstMoment = formatDateForComparison(first.eventDate)
  const secondMoment = formatDateForComparison(second.eventDate)
  return firstMoment.isBefore(secondMoment) ? -1 : 1
}
