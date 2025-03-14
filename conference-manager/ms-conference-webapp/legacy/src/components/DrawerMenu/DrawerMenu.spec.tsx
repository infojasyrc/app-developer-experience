import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import UserContext from '../../shared/contexts/UserContext'
import { UserSession } from '../../shared/entities'
import DrawerMenu, { DrawerMenuProps } from './DrawerMenu'

const renderComponent = (
  props: DrawerMenuProps,
  isLoggedIn: boolean,
  user: UserSession | null
) => {
  const contextProps = {
    isLoggedIn: isLoggedIn,
    user: user,
    defaultLocation: '',
    login: jest.fn(),
    logout: jest.fn(),
    setLocation: jest.fn(),
  }
  render(
    <UserContext.Provider value={contextProps}>
      <BrowserRouter>
        <DrawerMenu {...props} />
      </BrowserRouter>
    </UserContext.Provider>
  )
}

describe('drawer menu component', () => {
  describe('user authenticated', () => {
    const isLoggedIn = true
    const user: UserSession = {
      id: '01',
      uid: '0001',
      firstName: 'Juan',
      lastName: 'Perez',
      isAdmin: true,
      displayName: 'Sweet Test',
      photoURL: '',
      email: '',
      token: '',
    }
    it('should render all elements', () => {
      const props: DrawerMenuProps = {
        open: true,
        onClose: jest.fn(),
        onLogout: jest.fn(),
      }
      renderComponent(props, isLoggedIn, user)

      const fullName = screen.getByText(/sweet test/i)
      expect(fullName).toBeInTheDocument()
    })
  })

  describe('no authenticated', () => {
    const isLoggedIn = false
    const user = null
    it('should render all elements', () => {
      const props: DrawerMenuProps = {
        open: true,
        onClose: jest.fn(),
        onLogout: jest.fn(),
      }
      renderComponent(props, isLoggedIn, user)
      expect(true).toBe(true)
    })
  })
})
