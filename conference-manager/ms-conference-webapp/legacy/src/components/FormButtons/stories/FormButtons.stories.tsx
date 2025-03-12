import {Story, Meta} from '@storybook/react/types-6-0'

import FormButtons, {FormButtonsProps} from '../FormButtons'

export default {
  title: 'Container/FormButtons',
  component: FormButtons,
} as Meta

const Template: Story<FormButtonsProps> = (args) => <FormButtons {...args} />

export const Default = Template.bind({})
