import { Story, Meta } from '@storybook/react/types-6-0'

import { Conference } from '../../../shared/entities'
import EventCard, { EventCardProps } from '../EventCard'

export default {
  title: 'Container/EventCard',
  component: EventCard,
} as Meta

const Template: Story<EventCardProps> = (args) => <EventCard {...args} />

const eventCreated: Conference = {
  _id: '0001',
  description: 'Google IO 2021',
  name: 'Google IO 2021',
  status: 'created',
  eventDate: '2021-03-15T17:00:00.000',
  eventType: 'Sales',
}
export const Created = Template.bind({})
Created.args = {
  event: eventCreated,
}

const eventOpened: Conference = {
  _id: '',
  description: 'Google IO 2021',
  name: 'Google IO 2021',
  status: 'opened',
  eventDate: '2021-04-15T17:00:00.000',
  // photo: '/images/NoImage.png',
  eventType: 'Sales',
}
export const Opened = Template.bind({})
Opened.args = {
  event: eventOpened,
}

const eventPaused: Conference = {
  _id: '',
  description: 'Google IO 2021',
  name: 'Google IO 2021',
  status: 'paused',
  eventDate: '2021-05-15T17:00:00.000',
  // photo: '/images/NoImage.png',
  eventType: 'Sales',
}
export const Paused = Template.bind({})
Paused.args = {
  event: eventPaused,
}

const eventClosed: Conference = {
  _id: '',
  description: 'Google IO 2021',
  name: 'Google IO 2021',
  status: 'closed',
  eventDate: '2021-06-15T17:00:00.000',
  // photo: '/images/NoImage.png',
  eventType: 'Sales',
}
export const Closed = Template.bind({})
Closed.args = {
  event: eventClosed,
}
