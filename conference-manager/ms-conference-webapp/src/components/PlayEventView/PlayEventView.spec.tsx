import { render } from '@testing-library/react'

import PlayEventView, { PlayEventViewProps } from './PlayEventView'

import { Conference } from '../../shared/entities'

const renderComponent = (props: PlayEventViewProps) =>
  render(<PlayEventView {...props} />)

describe('play event view component', () => {
  it('should render an event with no images', () => {
    const event: Conference = {
      id: 'example',
      name: 'Test event',
      status: 'created',
      eventDate: '2021-03-15T17:00:00.000',
    }

    const props: PlayEventViewProps = {
      event,
      onFormClicked: jest.fn(),
      onBackClicked: jest.fn(),
    }

    renderComponent(props)
    expect(true).toBe(true)
  })

  xit('should render an event with two images', () => {
    const event: Conference = {
      id: 'example',
      name: 'Test event',
      status: 'created',
      eventDate: '2021-03-15T17:00:00.000',
      images: [
        {
          id: '',
          url: '',
        },
        {
          id: '',
          url: '',
        },
      ],
    }

    const props: PlayEventViewProps = {
      event,
      onFormClicked: jest.fn(),
      onBackClicked: jest.fn(),
    }

    renderComponent(props)
    expect(true).toBe(true)
  })
})
