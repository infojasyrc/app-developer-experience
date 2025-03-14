import { render, screen } from '@testing-library/react'

import { ImageMediaType } from '../../shared/entities'

import SliderView, { SlideViewProps } from './SlideView'

const renderComponent = (props: SlideViewProps) =>
  render(<SliderView {...props} />)

describe('slider view component', () => {
  it('should render all elements', () => {
    const props: SlideViewProps = {
      images: [],
      currentIndex: 0,
      direction: 'left',
    }
    renderComponent(props)

    const element = screen.getByTestId('slider-section')
    expect(element).toBeInTheDocument()
    expect(element.children.length).toBe(0)
  })

  it('should render with 2 images', () => {
    const sliderImages: ImageMediaType[] = [
      { id: '1', url: '' },
      { id: '2', url: '' },
    ]
    const props: SlideViewProps = {
      images: sliderImages,
      currentIndex: 0,
      direction: 'left',
    }
    renderComponent(props)

    const element = screen.getByTestId('slider-section')
    expect(element).toBeInTheDocument()
    expect(element.children.length).toBe(sliderImages.length)
  })
})
