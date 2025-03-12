import { render, screen } from '@testing-library/react'

import UserForm, { UserFormProps } from './UserForm'

const renderComponent = (props: UserFormProps) =>
  render(<UserForm {...props} />)

describe('user form component', () => {
  it('should render all elements', () => {
    const props: UserFormProps = {
      availableRoles: [],
    }
    renderComponent(props)

    const name = screen.getByRole('textbox', { name: 'Name', exact: true })
    const lastName = screen.getByRole('textbox', {
      name: 'Last Name',
      exact: true,
    })
    const email = screen.getByRole('textbox', {
      name: 'Email',
      exact: true,
    })
    const isAdmin = screen.getByRole('checkbox', {
      name: 'Is Admin',
      exact: true,
    })
    const saveButton = screen.getByRole('button', { name: 'Save', exact: true })
    const cancelButton = screen.getByRole('button', {
      name: 'Cancel',
      exact: true,
    })

    expect(name).toBeInTheDocument()
    expect(lastName).toBeInTheDocument()
    expect(email).toBeInTheDocument()
    expect(isAdmin).toBeInTheDocument()
    expect(saveButton).toBeInTheDocument()
    expect(cancelButton).toBeInTheDocument()
  })
})
