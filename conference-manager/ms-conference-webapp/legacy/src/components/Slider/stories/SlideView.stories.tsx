import { Story, Meta } from '@storybook/react/types-6-0'

import SlideView, { SlideViewProps } from '../SlideView'

export default {
  title: 'Container/SlideView',
  component: SlideView,
} as Meta

const Template: Story<SlideViewProps> = (args) => <SlideView {...args} />

export const EmptySlideView = Template.bind({})
EmptySlideView.args = {
  images: [],
  currentIndex: 0,
}

export const With2Images = Template.bind({})
With2Images.args = {
  images: [
    { id: '1', url: 'https://img.webnots.com/2014/04/110.png' },
    { id: '2', url: 'https://img.webnots.com/2014/04/21.png' },
  ],
  currentIndex: 0,
}

export const With2ImagesLeft = Template.bind({})
With2ImagesLeft.args = {
  images: [
    { id: '1', url: 'https://img.webnots.com/2014/04/110.png' },
    { id: '2', url: 'https://img.webnots.com/2014/04/21.png' },
  ],
  currentIndex: 0,
  direction: 'left',
}

export const With2ImagesRight = Template.bind({})
With2ImagesRight.args = {
  images: [
    { id: '1', url: 'https://img.webnots.com/2014/04/110.png' },
    { id: '2', url: 'https://img.webnots.com/2014/04/21.png' },
  ],
  currentIndex: 0,
  direction: 'right',
}
