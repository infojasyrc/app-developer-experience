import { Story, Meta } from '@storybook/react/types-6-0'

import Loading, { LoadingProps } from '../Loading'

export default {
  title: 'Core/Loading',
  component: Loading,
} as Meta

const Template: Story<LoadingProps> = (args) => <Loading {...args} />

export const ShowLoading = Template.bind({})
ShowLoading.args = {
  isLoading: true
}
