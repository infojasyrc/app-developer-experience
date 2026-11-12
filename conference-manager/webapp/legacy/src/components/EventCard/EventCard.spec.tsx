import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EventCard, { EventCardProps } from './EventCard'

const mockUseHistory = jest.fn()
jest.mock('react-router-dom', () => ({
  useHistory: () => mockUseHistory(),
}))

const renderComponent = (props: EventCardProps) =>
  render(<EventCard {...props} />)

afterAll(() => {
  jest.clearAllMocks()
  jest.resetAllMocks()
  jest.resetModules()
})

xdescribe('event card component', () => {
  it('should render empty', () => {
    const props: EventCardProps = {
      event: {
        _id: '0001',
        description: 'Conquering the world',
        name: 'Conquering the world',
        status: 'created',
        eventDate: '2021-10-10',
        eventType: 'Sales',
      },
    }
    renderComponent(props)
    const conferenceName = screen.getByText(/conquering the world/i)
    expect(conferenceName).toBeInTheDocument()
  })

  it('should event call more info', () => {
    const mockUserHistoryPush = jest.fn()
    mockUseHistory.mockReturnValueOnce({
      push: () => mockUserHistoryPush(),
    })
    const props: EventCardProps = {
      event: {
        _id: '0001',
        name: 'Conquering the world',
        description: 'Conquering the world',
        status: 'created',
        eventDate: '2021-10-10',
        images: [
          {
            id: '',
            url: '',
          },
        ],
        eventType: 'Sales',
      },
    }

    renderComponent(props)
    const moreInfoButton = screen.getByText(/more info/i)
    expect(moreInfoButton).toBeInTheDocument()
    userEvent.click(moreInfoButton)

    waitFor(() => {
      expect(mockUserHistoryPush).toHaveBeenCalled()
    })
  })
})
