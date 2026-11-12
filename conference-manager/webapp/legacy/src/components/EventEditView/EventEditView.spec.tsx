import { render, screen } from '@testing-library/react'

import EventEditView, { EventEditViewProps } from './EventEditView'
import { Conference } from '../../shared/entities'

const renderComponent = (props: EventEditViewProps) =>
  render(<EventEditView {...props} />)

const mockHeadquarters = [
  { _id: '64c3f59244d9afa500ea1422', name: 'Piura' },
  { _id: '64c3f59244d9afa500ea1423', name: 'Lima' },
]

describe('event view component', () => {
  it('should render all elements', () => {
    const mockEvent: Conference = {
      _id: '64c3f59244d9afa500ea1422',
      name: 'Event name',
      description: 'Event description',
      eventDate: '2021-09-30T00:00:00.000Z',
      address: 'Event address',
      headquarter: mockHeadquarters[0],
      tags: [],
      eventType: 'Recruiting',
      status: 'active',
    }
    const props: EventEditViewProps = {
      eventData: mockEvent,
      headquarters: mockHeadquarters,
      isLoading: false,
      validation: { name: { error: false }, eventDate: { error: false } },
      onSubmit: jest.fn(),
      onBack: jest.fn(),
    }
    renderComponent(props)

    const eventName = screen.getByText(/title/i)
    const eventDate = screen.getByText(/date/i)
    // TODO: headquarter should be validated
    // const headquarter = screen.getByText(/HQ/i)
    const address = screen.getByText(/address/i)
    const type = screen.getByText(/address/i)
    const tags = screen.getByText(/event type/i)
    const description = screen.getByText(/description/i)
    const phoneNumber = screen.getByText(/phone/i)
    const salesEventType = screen.getByRole('radio', { name: /Recruiting/i })

    expect(eventName).toBeInTheDocument()
    expect(eventDate).toBeInTheDocument()
    expect(address).toBeInTheDocument()
    // TODO: headquarter should be validated
    // expect(headquarter).toBeInTheDocument()
    expect(type).toBeInTheDocument()
    expect(tags).toBeInTheDocument()
    expect(description).toBeInTheDocument()
    expect(phoneNumber).toBeInTheDocument()
    expect(salesEventType).toBeInTheDocument()
  })
})
