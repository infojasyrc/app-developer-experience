import { render, screen } from '@testing-library/react'

import UserList, { UserListProps } from './UserList'

const renderComponent = (props: UserListProps) =>
  render(<UserList {...props} />)

describe('user list component', () => {
  it('should render an empty list', () => {
    const props: UserListProps = {
      users: [],
    }
    renderComponent(props)
    const mailTitle = screen.getByText(/mail/i)
    const fullNameTitle = screen.getByText(/full name/i)
    const roleTitle = screen.getByText(/role/i)
    expect(mailTitle).toBeInTheDocument()
    expect(fullNameTitle).toBeInTheDocument()
    expect(roleTitle).toBeInTheDocument()
  })

  it('should render a list with 2 elements', () => {
    const props: UserListProps = {
      users: [
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
        }
      ],
    }
    renderComponent(props)

    const mailTitle = screen.getByText(/mail/i)
    const fullNameTitle = screen.getByText(/full name/i)
    const roleTitle = screen.getByText(/role/i)

    expect(mailTitle).toBeInTheDocument()
    expect(fullNameTitle).toBeInTheDocument()
    expect(roleTitle).toBeInTheDocument()

    expect(screen.getByText(/jose sanz/i)).toBeInTheDocument()
    expect(screen.getByText(/juan perez/i)).toBeInTheDocument()
  })
})
