// TODO: Unit test bad design: Use provider
import { render, screen } from '@testing-library/react'

import Main, { MainProps } from './Main'

const mockUseMediaQuery = jest.fn()
jest.mock('@mui/material', () => ({
  useMediaQuery: () => mockUseMediaQuery(),
}))

const mockUseLocation = jest.fn()
jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    pathname: '/login',
  }),
}))

const mockLogout = jest.fn()
jest.mock('../../shared/api', () => ({
  Authentication: () => {
    return {
      logoutApp: () => mockLogout(),
    }
  },
}))

// TODO: Make a research to handle unit tests with context
const renderMainComponent = (props: MainProps) => render(<Main {...props} />)

describe('Main component', () => {
  describe('when no login', () => {

    describe('Device is MOBILE', () => {
      afterEach(() => {
        jest.resetAllMocks()
      })
  
      it.skip('should render all elements', () => {
        mockUseLocation.mockReturnValue({
          pathname: '/events',
        })
        mockUseMediaQuery.mockReturnValue(false)
        
        const props: MainProps = {
          children: <div />,
        }
        
        renderMainComponent(props)
        
        const appBar = screen.getByTestId('Header')
        expect(appBar).toBeInTheDocument()
      })
    })
  
    describe('Device is DESKTOP', () => {
      afterEach(() => {
        jest.resetAllMocks()
      })
  
      it.skip('should render all elements', () => {
        mockUseLocation.mockReturnValue({
          pathname: '/events',
        })
        mockUseMediaQuery.mockReturnValue(true)
        
        const props: MainProps = {
          children: <div />,
        }
        
        renderMainComponent(props)
        
        const appBar = screen.getByText('Header')
        expect(appBar).toBeInTheDocument()
      })
    })
  })
})
