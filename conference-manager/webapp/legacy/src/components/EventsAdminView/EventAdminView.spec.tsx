import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EventAdminView, { EventsAdminViewProps } from './EventAdminView'

import { Conference, Headquarter } from '../../shared/entities'

const renderComponent = (props: EventsAdminViewProps) =>
  render(<EventAdminView {...props} />)

const mockHeadquarter01: Headquarter = {
  _id: '0001',
  name: 'Piura',
}

const mockHeadquarter02: Headquarter = {
  _id: '0002',
  name: 'Lima',
}

const mockEvent01: Conference = {
  _id: '0001',
  name: 'Development Day',
  description: 'Event 01 description',
  eventDate: '2023-01-19',
  status: 'active',
  year: 2023,
  headquarter: mockHeadquarter01,
  eventType: 'Sales',
}

const mockEvent02: Conference = {
  _id: '0002',
  name: 'Storm',
  description: 'Event 02 description',
  eventDate: '2023-04-19',
  status: 'created',
  year: 2023,
  headquarter: mockHeadquarter01,
  eventType: 'Sales',
}

const mockEvent03: Conference = {
  _id: '0003',
  name: 'Google IO',
  description: 'Event 03 description',
  eventDate: '2023-08-19',
  status: 'created',
  year: 2023,
  headquarter: mockHeadquarter02,
  eventType: 'Sales',
}


const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
  useParams: () => ({
    id: '64cc04d273db4bafb6f93af0',
  }),
  useRouteMatch: () => ({ url: '/event/edit/64cc04d273db4bafb6f93af0' }),

  useHistory: () => ({
    push: mockHistoryPush,
  }),
}))

const mockEventsAPI = jest.fn()
jest.mock('../../shared/api/endpoints/events', () => () => mockEventsAPI())

describe('event table list component', () => {
  it('should render a table with 2 elements', () => {
    const props: EventsAdminViewProps = {
      events: [
        mockEvent01,
        mockEvent02,
      ],
      allHeadquarters: [],
      loadingEvents: false,
      loadingHeadquarters: false,
      selectedHeadquarter: '',
      updateEvents: jest.fn(),
      updateStatusEvents: jest.fn(),
    }

    renderComponent(props)

    const nameTitle = screen.getByText(/Name/i)
    const subscriptionsTitle = screen.getByText(/# subscriptions/i)
    const statusTitle = screen.getByText(/Status/i)
    const actionsTitle = screen.getByText(/Actions/i)

    expect(nameTitle).toBeInTheDocument()
    expect(subscriptionsTitle).toBeInTheDocument()
    expect(statusTitle).toBeInTheDocument()
    expect(actionsTitle).toBeInTheDocument()

    expect(screen.getByText(/development day/i)).toBeInTheDocument()
    expect(screen.getByText(/storm/i)).toBeInTheDocument()
  })

  it('should render 3 events and filtered by headquarter ', async () => {
    const mockEvents: Conference[] = [mockEvent01, mockEvent02, mockEvent03]
    const mockHeadquarters: Headquarter[] = [
      mockHeadquarter01,
      mockHeadquarter02,
    ]
    const props: EventsAdminViewProps = {
      events: mockEvents,
      allHeadquarters: mockHeadquarters,
      loadingEvents: false,
      loadingHeadquarters: false,
      updateEvents: jest.fn(),
      updateStatusEvents: jest.fn((mockEvent01) => mockEvent01),
    }
    renderComponent(props)
    const eventsTitle = screen.getByText(/events/i)

    const eventElement01 = screen.getByText(/development day/i)
    const eventElement02 = screen.getByText(/storm/i)
    const eventElement03 = screen.getByText(/google io/i)

    expect(eventsTitle).toBeInTheDocument()

    expect(eventElement01).toBeInTheDocument()
    expect(eventElement02).toBeInTheDocument()
    expect(eventElement03).toBeInTheDocument()

    const dropdownLabel = /choose a headquarter/i
    const headquarterDropdown = await screen.findByLabelText(dropdownLabel)

    expect(headquarterDropdown).toBeInTheDocument()

    userEvent.click(headquarterDropdown)

    const listbox = await screen.findByRole('listbox')

    userEvent.click(within(listbox).getByText(/piura/i))

    expect(await screen.findByText(/piura/i)).toBeInTheDocument()

    waitFor(async() => {
      expect(screen.queryByText(/development day/i)).toBeInTheDocument()
      expect(screen.queryByText(/storm/i)).toBeInTheDocument()
      expect(screen.queryByText(/google io/i)).not.toBeInTheDocument()
    })
  })
})
