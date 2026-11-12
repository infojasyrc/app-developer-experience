import { render, screen } from '@testing-library/react'

import EventTypes, {EventTypesProps} from './EventTypes'

const renderComponent = (props: EventTypesProps) => render(<EventTypes {...props} />)

describe('event types component', () => {
  it('should render all elements', () => {
    const props: EventTypesProps = {
      selectedEventType: '',
      onUpdateEventType: jest.fn(),
    }
    renderComponent(props)
    const recruitingButton = screen.getByText(/Recruiting/i)
    expect(recruitingButton).toBeInTheDocument()
    const salesButton = screen.getByText(/Sales/i)
    expect(salesButton).toBeInTheDocument()
  })

  it('should show a selected option', () => {
    const props: EventTypesProps = {
      selectedEventType: 'Sales',
      onUpdateEventType: jest.fn(),
    }
    renderComponent(props)

    const salesButton = screen.getByRole('radio', {name: /Sales/i})
    expect(salesButton).toBeInTheDocument()
    expect(salesButton).toBeChecked()
  })
})
