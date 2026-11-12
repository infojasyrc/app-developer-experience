import { Conference } from '../entities/conference'

export const sortAscending = (a: Conference, b: Conference): number =>
  new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()

export const sortDescending = (a: Conference, b: Conference): number =>
  new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
