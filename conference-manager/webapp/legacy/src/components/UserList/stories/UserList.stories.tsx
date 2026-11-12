import { Story, Meta } from '@storybook/react/types-6-0'

import { User } from '../../../shared/entities'

import UserList, { UserListProps } from '../UserList'

export default {
  title: 'Container/UserList',
  component: UserList,
} as Meta

const Template: Story<UserListProps> = (args) => <UserList {...args} />

export const BasicList = Template.bind({})
const users: User[] = [
  {
    uid: '0001',
    email: 'test0001@correo.com',
    firstName: 'Jose',
    lastName: 'Sanz',
    isAdmin: false,
  },
  {
    uid: '0002',
    email: 'test0002@correo.com',
    firstName: 'Juan',
    lastName: 'Perez',
    isAdmin: false,
  },
]
BasicList.args = {
  users,
}
