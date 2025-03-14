import { Story, Meta } from '@storybook/react/types-6-0'
import Header from '../Header'
import { HeaderProps } from '../types'

export default {
  title: 'AppBarWeb',
  component: Header,
} as Meta

const Template: Story<HeaderProps> = (args) => <Header {...args} />

export const Authenticated = Template.bind({})
Authenticated.args = {
  version: '14.1',
  isAuthenticated: true,
  username: 'usertest@chupito.com',
  onLogin: () => {},
  onLogout: () => {},
}

export const NoAuthenticated = Template.bind({})
NoAuthenticated.args = {
  version: '14.1',
  isAuthenticated: false,
  username: '',
  onLogin: () => {},
  onLogout: () => {},
}
