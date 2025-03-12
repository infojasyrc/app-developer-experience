import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Login, { LoginProps } from './Login'

const renderComponent = (props: LoginProps) => render(<Login {...props} />)

describe('login view component', () => {
  it('should render all elements', () => {
    const mockOnLogin = jest.fn()
    const props: LoginProps = {
      onLogin: mockOnLogin,
      loading: true,
      googleOnLogin: mockOnLogin,
      errorMessage: false,
    }
    renderComponent(props)

    const userField = screen.getByRole('textbox', { name: /email/i })
    expect(userField).toBeInTheDocument()

    const passwordField = screen.getByLabelText(/password/i)
    expect(passwordField).toBeInTheDocument()

    const buttonField = screen.getByRole('button', { name: /login/i })
    expect(buttonField).toBeInTheDocument()
    expect(buttonField).not.toBeEnabled()
  })

  it('should click on login button ', () => {
    const mockOnLogin = jest.fn()
    const props: LoginProps = {
      onLogin: mockOnLogin,
      loading: true,
      googleOnLogin: mockOnLogin,
      errorMessage: false
    }
    renderComponent(props)

    const userField = screen.getByRole('textbox', { name: /email/i })
    expect(userField).toBeInTheDocument()

    const passwordField = screen.getByLabelText(/password/i)
    expect(passwordField).toBeInTheDocument()

    const buttonField = screen.getByRole('button', { name: /Login/i })
    expect(buttonField).toBeInTheDocument()

    userEvent.type(userField, 'testuser@chupito.com')
    expect(userField).toHaveValue('testuser@chupito.com')

    userEvent.type(passwordField, 'TesT#975')
    expect(passwordField).toHaveValue('TesT#975')

    waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent(/Login/i)
       expect(mockOnLogin).toHaveBeenCalled()
      expect(mockOnLogin).toHaveBeenCalledTimes(1)
    })
  })
  it('error password ', () => {
    const mockOnLogin = jest.fn()
    const props: LoginProps = {
      onLogin: mockOnLogin,
      loading: true,
      googleOnLogin: mockOnLogin,
      errorMessage: true
    }
    renderComponent(props)

    const userField = screen.getByRole('textbox', { name: /email/i })
    expect(userField).toBeInTheDocument()

    const passwordField = screen.getByLabelText(/password/i)
    expect(passwordField).toBeInTheDocument()

    const buttonField = screen.getByRole('button', { name: /Login/i })
    expect(buttonField).toBeInTheDocument()

    userEvent.type(userField, 'testuser@chupito.com')
    expect(userField).toHaveValue('testuser@chupito.com')

    userEvent.type(passwordField, 'TesT#9yuyi')
    expect(passwordField).toHaveValue('TesT#9yuyi')

    waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent(/Login/i)
       expect(mockOnLogin).toHaveBeenCalled()
       expect('Incorrect password').toBeInTheDocument()
    })
  })
})
