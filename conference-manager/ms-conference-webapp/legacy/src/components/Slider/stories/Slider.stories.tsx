import { Story, Meta } from '@storybook/react/types-6-0'

import Slider, { SliderProps } from '../Slider'

export default {
  title: 'Container/Slider',
  component: Slider,
} as Meta

const Template: Story<SliderProps> = (args) => <Slider {...args} />

export const Empty = Template.bind({})
Empty.args = {
  images: [],
  onFormClicked: () => {},
  startPaused: false,
}

export const With2Images = Template.bind({})
With2Images.args = {
  images: [
    { id: '1', url: 'https://img.webnots.com/2014/04/110.png' },
    { id: '2', url: 'https://img.webnots.com/2014/04/21.png' },
  ],
  onFormClicked: () => {},
  startPaused: false,
}
