import { render, screen } from '@testing-library/react'

import Slider, { SliderProps } from './Slider'

const renderComponent = (props: SliderProps) => render(<Slider {...props} />)

describe('slider component', () => {
  it('should render all elements', () => {
    const sliderProps: SliderProps = {
      images: [],
      startPaused: false,
      onFormClicked: jest.fn(),
    }
    renderComponent(sliderProps)

    const btnRegistrate = screen.getByRole('button', { name: /registrate/i })
    const btnSliderLeft = screen.queryByTestId('btnSliderLeft')
    const btnSliderRight = screen.queryByTestId('btnSliderRight')
    
    expect(btnRegistrate).toBeInTheDocument()
    expect(btnSliderLeft).not.toBeInTheDocument()
    expect(btnSliderRight).not.toBeInTheDocument()
  })
})
