import { render, screen } from '@testing-library/react'

import NavigationBar, { NavigationBarProps } from './NavigationBar'

const renderComponent = (props: NavigationBarProps) =>
  render(<NavigationBar {...props} />)

describe('navigation bar component', () => {
  it('should render with logo', () => {
    const props: NavigationBarProps = {
      title: 'Test',
      showLogo: true,
    }
    renderComponent(props)

    const backButton = screen.getByTestId(/navigation-back-button/)
    expect(backButton).toBeInTheDocument()

    const navigationLogo = screen.getByTestId(/navigation-logo-img/)
    expect(navigationLogo).toBeInTheDocument()
  })

  it('should render with no logo', () => {
    const props: NavigationBarProps = {
      title: 'Test',
      showLogo: false,
    }
    renderComponent(props)

    const backButton = screen.getByTestId(/navigation-back-button/)
    expect(backButton).toBeInTheDocument()

    const navigationLogo = screen.queryByTestId(/navigation-logo-img/)
    expect(navigationLogo).not.toBeInTheDocument()
  })
})
