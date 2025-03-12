import { render, screen } from '@testing-library/react'

import TimerButton, { TimerButtonProps } from './TimerButton'

const renderComponent = (props: TimerButtonProps) =>
  render(<TimerButton {...props} />)

describe('timer button component', () => {
  it('shoud render all elements', () => {
    const timerButtonProps: TimerButtonProps = {
      onClick: jest.fn(),
      onTimer: jest.fn(),
      time: 200,
    }
    renderComponent(timerButtonProps)

    const element = screen.getByTestId('timer-pause-button')
    expect(element).toBeInTheDocument()
  })
})
