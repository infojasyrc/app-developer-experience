import {Story, Meta} from '@storybook/react/types-6-0'

import TextFieldWithValidation, {TextFieldWithValidationProps} from '../TextFieldWithValidation'

export default {
  title: 'Core/TextFieldWithValidation',
  component: TextFieldWithValidation,
} as Meta

const Template: Story<TextFieldWithValidationProps> = (args) => <TextFieldWithValidation {...args} />

export const TextField = Template.bind({})
TextField.args = {
  id: 'textfield',
  name: 'txtTextField',
  label: 'This is a textfield',
  error: false,
  helperText: '',
  required: true,
  disabled: false,
}
