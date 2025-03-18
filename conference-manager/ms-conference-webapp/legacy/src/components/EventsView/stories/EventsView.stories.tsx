import { Story, Meta } from '@storybook/react/types-6-0'
import { Conference, Headquarter } from '../../../shared/entities'

import EventsView, { EventsViewProps } from '../EventsView'

export default {
  title: 'Container/EventsView',
  component: EventsView,
} as Meta

const Template: Story<EventsViewProps> = (args) => <EventsView {...args} />

export const BasicList = Template.bind({})
const headquarters: Headquarter[] = [
  {
    _id: '0001',
    name: 'Piura'
  }, {
    _id: '002',
    name: 'Lima'
  }
]
const events: Conference[] = [
  {
    _id: '00001',
    description: 'Description 01',
    eventDate: '2023-01-30T23:23:00.000',
    name: 'Event 01',
    status: 'created',
    headquarter: Object.assign({}, headquarters[0]),
    year: 2023,
    eventType: 'Sales',
  },
  {
    _id: '00002',
    description: 'Description 02',
    eventDate: '2023-10-30T23:23:00.000',
    name: 'Event 02',
    status: 'created',
    year: 2023,
    eventType: 'Sales',
  }
]
BasicList.args = {
  allHeadquarters: headquarters,
  events: events,
  isAdmin: false,
  loadingEvents: false,
  loadingHeadquarters: false,
}
