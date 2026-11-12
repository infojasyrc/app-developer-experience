import { render, screen } from '@testing-library/react'

import EventView, { EventViewProps } from './EventView'
import { Conference } from '../../shared/entities'

const renderComponent = (props: EventViewProps) =>
  render(<EventView {...props} />)

const mockHeadquarters = [
  { _id: '64c3f59244d9afa500ea1422', name: 'Piura' },
  { _id: '64c3f59244d9afa500ea1423', name: 'Lima' },
]

describe('event view component', () => {
  it('should render all elements', () => {
    const props: EventViewProps = {
      headquarters: mockHeadquarters,
      tags: [
        { _id: 'Architecture', name: 'Architecture' },
        { _id: 'Design', name: 'Design' },
      ],
      eventData: {
        _id: '0',
        eventType: 'Sales',
        tags: ['Design'],
        description: 'Test',
        name: 'Test',
        eventDate: '2023-03-15T17:00:00.000',
        address: '121 Main Street',
        phoneNumber: '3100000000',
        status: 'active',
        headquarter: mockHeadquarters[0],
      } as Conference,
      isLoading: false,
      validation: { name: { error: false }, eventDate: { error: false } },
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
    }
    renderComponent(props)

    const eventName = screen.getByText(/title/i)
    const eventDate = screen.getByText(/date/i)
    const headquarter = screen.getByText(/HQ/i)
    const address = screen.getByText(/address/i)
    const type = screen.getByText(/address/i)
    const tags = screen.getByText(/event type/i)
    const description = screen.getByText(/description/i)
    const phoneNumber = screen.getByText(/phone/i)
    const salesEventType = screen.getByRole('radio', { name: /Recruiting/i })
    
    expect(eventName).toBeInTheDocument()
    expect(eventDate).toBeInTheDocument()
    expect(address).toBeInTheDocument()
    expect(headquarter).toBeInTheDocument()
    expect(type).toBeInTheDocument()
    expect(tags).toBeInTheDocument()
    expect(description).toBeInTheDocument()
    expect(phoneNumber).toBeInTheDocument()
    expect(salesEventType).toBeInTheDocument()
  })
})
