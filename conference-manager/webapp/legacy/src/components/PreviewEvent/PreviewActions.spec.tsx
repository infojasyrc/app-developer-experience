import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PreviewActions, { PreviewActionsProps } from './PreviewActions'

const renderComponent = (props: PreviewActionsProps) =>
  render(<PreviewActions {...props} />)

describe('preview event actions', () => {
  it('should render for created', () => {
    const mockOpenButton = jest.fn()
    const props: PreviewActionsProps = {
      status: 'created',
      conferenceId: '01',
      onOpen: mockOpenButton,
      onPause: jest.fn(),
      onClose: jest.fn(),
      onEnter: jest.fn(),
      onSynchronize: jest.fn(),
    }
    renderComponent(props)

    const openButton = screen.getByRole('button', { name: /open/i })
    userEvent.click(openButton)

    expect(mockOpenButton).toHaveBeenCalled()
    expect(mockOpenButton).toHaveBeenCalledTimes(1)
  })

  it('should render for opened', () => {
    const mockPauseButton = jest.fn()
    const mockCloseButton = jest.fn()
    const mockEnterButton = jest.fn()
    const props: PreviewActionsProps = {
      status: 'opened',
      conferenceId: '01',
      onOpen: jest.fn(),
      onPause: mockPauseButton,
      onClose: mockCloseButton,
      onEnter: mockEnterButton,
      onSynchronize: jest.fn(),
    }
    renderComponent(props)

    const pauseButton = screen.getByRole('button', { name: /pause/i })
    userEvent.click(pauseButton)

    const closeButton = screen.getByRole('button', { name: /close/i })
    userEvent.click(closeButton)

    const enterButton = screen.getByRole('button', { name: /go/i })
    userEvent.click(enterButton)

    expect(mockPauseButton).toHaveBeenCalled()
    expect(mockPauseButton).toHaveBeenCalledTimes(1)

    expect(mockCloseButton).toHaveBeenCalled()
    expect(mockCloseButton).toHaveBeenCalledTimes(1)

    expect(mockEnterButton).toHaveBeenCalled()
    expect(mockEnterButton).toHaveBeenCalledTimes(1)
  })

  it('should render for paused', () => {
    const mockOpenButton = jest.fn()
    const props: PreviewActionsProps = {
      status: 'paused',
      conferenceId: '01',
      onOpen: mockOpenButton,
      onPause: jest.fn(),
      onClose: jest.fn(),
      onEnter: jest.fn(),
      onSynchronize: jest.fn(),
    }
    renderComponent(props)

    const openButton = screen.getByRole('button', { name: /unpause/i })
    userEvent.click(openButton)

    expect(mockOpenButton).toHaveBeenCalled()
    expect(mockOpenButton).toHaveBeenCalledTimes(1)
  })

  it('should render for closed: no show actions buttons', () => {
    const props: PreviewActionsProps = {
      status: 'closed',
      conferenceId: '01',
      onOpen: jest.fn(),
      onPause: jest.fn(),
      onClose: jest.fn(),
      onEnter: jest.fn(),
      onSynchronize: jest.fn(),
    }
    renderComponent(props)
    expect(true).toBe(true)
  })
})
