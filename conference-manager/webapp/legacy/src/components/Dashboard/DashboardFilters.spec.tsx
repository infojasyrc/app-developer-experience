import { render, screen } from '@testing-library/react'

import DashboardFilters, { DashboardFiltersProps } from './DashboardFilters'

const renderComponent = (props: DashboardFiltersProps) =>
  render(<DashboardFilters {...props} />)

describe('dashboard filters component', () => {
  it('should render filter', () => {
    const props: DashboardFiltersProps = {
      onChangeFilters: jest.fn()
    }
    renderComponent(props)
    const section = screen.getByTestId('gridDashboardFilters')
    expect(section).toBeInTheDocument()
  })
})
