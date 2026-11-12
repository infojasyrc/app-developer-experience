import { render, screen } from '@testing-library/react'
import Header from './Header'
import { HeaderProps } from './types';

const renderComponent = (props: HeaderProps) =>
  render(<Header {...props} />)

describe('Header component', () => {
  describe('when is not authenticated', () => {
    const props: HeaderProps = {
      version: '1.2',
      isAuthenticated: false,
      username: '',
      onLogin: jest.fn(),
      onLogout: jest.fn(),
    }

    it('should render login button', () => {
      renderComponent(props)
      
      const version = screen.getByText(/v1.2/i)
      const loginButton = screen.getByText(/Login/i)
      const logoutButton = screen.queryByText(/logout/i)
      
      expect(version).toBeInTheDocument()
      expect(loginButton).toBeInTheDocument()
      expect(logoutButton).not.toBeInTheDocument()
    })
  });

  describe('when is authenticated', () => {
    const props: HeaderProps = {
      isAuthenticated: true,
      username: 'user@test.com',
      onLogin: jest.fn(),
      onLogout: jest.fn(),
      version: '1.2',
    }
    it('should render logout button', () => {
      renderComponent(props)
      
      const version = screen.getByText(/v1.2/i)
      const loginButton = screen.queryByText(/Login/i)
      const username = screen.getByText('user@test.com')
      const logoutButton = screen.getByText(/logout/i)
      
      expect(version).toBeInTheDocument()
      expect(username).toBeInTheDocument()
      expect(loginButton).not.toBeInTheDocument()
      expect(logoutButton).toBeInTheDocument()
    })
  })
})
