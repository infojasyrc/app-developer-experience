import { Story, Meta } from '@storybook/react/types-6-0'

import EventView, { EventViewProps } from '../EventView'

export default {
  title: 'Container/EventView',
  component: EventView,
} as Meta

const Template: Story<EventViewProps> = (args) => <EventView {...args} />

const headquarters = [
  { _id: '1', name: 'Piura' },
  { _id: '2', name: 'Lima' },
]

export const Empty = Template.bind({})
Empty.args = {
  eventData: {
    _id: '',
    eventType: '',
    name: '',
    description: '',
    eventDate: '',
    address: '',
    phoneNumber: '',
    headquarter: headquarters[0],
    status: 'created',
  },
  headquarters: headquarters,
  isLoading: false,
  validation: {
    name: { error: false, message: '' },
    eventDate: { error: false, message: '' },
  },
  onSubmit: () => {},
  onCancel: () => {},
}
