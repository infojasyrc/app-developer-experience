import { Story, Meta } from '@storybook/react/types-6-0'

import EventTypes, { EventTypesProps } from '../EventTypes'

export default {
  title: 'Container/EventTypes',
  component: EventTypes,
} as Meta

const Template: Story<EventTypesProps> = (args) => <EventTypes {...args} />

export const Empty = Template.bind({})
Empty.args = {
  selectedEventType: '',
  onUpdateEventType: () => {}
}

export const Recruiting = Template.bind({})
Recruiting.args = {
  selectedEventType: 'recruiting',
  onUpdateEventType: () => {}
}

export const Sales = Template.bind({})
Sales.args = {
  selectedEventType: 'sales',
  onUpdateEventType: () => {}
}
