import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ImagesPreview, { ImagesPreviewProps } from './ImagesPreview'

const renderComponent = (props: ImagesPreviewProps) =>
  render(<ImagesPreview {...props} />)

describe('images preview component', () => {
  it('should render with add button', () => {
    const mockOnAdd = jest.fn()
    const props: ImagesPreviewProps = {
      images: [],
      selectedImages: [],
      enableEdit: true,
      onChange: mockOnAdd,
      onDelete: jest.fn(),
    }
    renderComponent(props)
    
    const addButton = screen.getByTestId('add-media-button')
    userEvent.click(addButton)
    
    expect(addButton).toBeInTheDocument()
  })

  it('should render with no add button', () => {
    const props: ImagesPreviewProps = {
      images: [],
      selectedImages: [],
      enableEdit: false,
      onChange: jest.fn(),
      onDelete: jest.fn(),
    }
    renderComponent(props)
    
    const addButton = screen.queryByTestId('add-media-button')
    expect(addButton).not.toBeInTheDocument()
  })
})
