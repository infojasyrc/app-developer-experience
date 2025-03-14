import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

import LeftMenu, { LeftMenuProps } from './LeftMenu'

const renderComponent = (props: LeftMenuProps) =>
  render(
    <BrowserRouter>
      <LeftMenu {...props} />
    </BrowserRouter>
  )

describe('left menu component', () => {
  it('should render elements for admin', () => {
    const props: LeftMenuProps = {
      isAdmin: true,
    }
    renderComponent(props)

    expect(screen.getByText(/change password/i)).toBeInTheDocument()
    expect(screen.getByText(/events/i)).toBeInTheDocument()
    expect(screen.getByText(/users/i)).toBeInTheDocument()
  })

  it('should render elements for no admin', () => {
    const props: LeftMenuProps = {
      isAdmin: false,
    }
    renderComponent(props)
    expect(screen.getByText(/change password/i)).toBeInTheDocument()
    expect(screen.getByText(/events/i)).toBeInTheDocument()
    expect(screen.queryByText(/users/i)).not.toBeInTheDocument()
  })
})
