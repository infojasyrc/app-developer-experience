import { render, screen } from '@testing-library/react'
import Carousel, { CarouselProps } from './Carousel'

const renderComponent = (props: CarouselProps) =>
  render(<Carousel {...props} />)
describe('Carousel component', () => {
  const props: CarouselProps = {
    items: [
      { img: 'image1', title: 'Title 1' },
      { img: 'image2', title: 'Title 2' },
      { img: 'image3', title: 'Title 3' },
    ],
  }
  it('should render all elements', () => {
    renderComponent(props)

    expect(screen.getByAltText('Title 1')).toBeInTheDocument();
    expect(screen.getByAltText('Title 2')).toBeInTheDocument();
    expect(screen.getByAltText('Title 3')).toBeInTheDocument();


    expect(screen.getByTestId(/desktop-arrow-left-button/i)).toBeInTheDocument();
    expect(screen.getByTestId(/desktop-arrow-right-button/i)).toBeInTheDocument();
 
  })
})
