import { screen, render } from '@testing-library/react'

import EventList, { EventListProps } from './EventList'

const renderComponent = (compProps: EventListProps) =>
  render(<EventList {...compProps} />)

describe('event list component', () => {
  it('should render empty ', () => {
    const props: EventListProps = {
      events: [],
    }
    renderComponent(props)

    expect(
      screen.getByText(/No results found for the selected year and headquarter/)
    ).toBeInTheDocument()
  })
})
