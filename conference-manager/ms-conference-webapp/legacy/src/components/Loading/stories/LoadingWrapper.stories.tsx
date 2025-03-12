import { Story, Meta } from '@storybook/react/types-6-0'

import LoadingWrapper, { LoadingWrapperProps } from '../LoadingWrapper'

export default {
  title: 'Core/LoadingWrapper',
  component: LoadingWrapper,
} as Meta

const Template: Story<LoadingWrapperProps> = (args) => (
  <LoadingWrapper {...args} />
)

const childComponent: JSX.Element = (
  <div>
    <p>Element Test</p>
  </div>
)

export const ShowLoadingWrapper = Template.bind({})
ShowLoadingWrapper.args = {
  isLoading: true,
  middlePosition: { top: '10px', left: '20px' },
  children: childComponent,
}
