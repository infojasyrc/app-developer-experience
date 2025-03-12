import { Story, Meta } from '@storybook/react/types-6-0'

import SelectWithLoading, {SelectWithLoadingProps} from '../SelectWithLoading'

export default {
  title: 'Core/SelectWithLoading',
  component: SelectWithLoading,
} as Meta

const Template: Story<SelectWithLoadingProps> = (args) => <SelectWithLoading {...args} />

export const Empty = Template.bind({})
Empty.args = {
  attributeName: 'name',
  attributeLabel: 'This is a Dropdown with Loader',
  attributeRequired: true,
  attributeOptions: [],
  attributeValue: '',
  error: false,
  errorMessage: '',
  onChange: () => {},
  onBlur: () => {},
  isLoading: false,
}

export const WithData = Template.bind({})
WithData.args = {
  attributeName: 'name',
  attributeLabel: 'This is a Dropdown with Loader',
  attributeRequired: true,
  attributeOptions: [
    { _id: 'piura', name: 'Piura' },
    { _id: 'lima', name: 'Lima' },
  ],
  attributeValue: '',
  error: false,
  errorMessage: '',
  onChange: () => {},
  onBlur: () => {},
  isLoading: false,
}
