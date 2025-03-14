import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import RenderImage, { RenderImageProps } from './RenderImage'

const renderComponent = (props: RenderImageProps) =>
  render(<RenderImage {...props} />)

describe('render image component', () => {
  it('should render with edit button', () => {
    const mockDeleteButton = jest.fn()
    const props: RenderImageProps = {
      contentId: '01',
      contentType: 'image',
      contentSrc: '',
      allowEdit: true,
      onDelete: mockDeleteButton,
    }
    renderComponent(props)
    const removeButton = screen.getByTestId('del-media-button')
    userEvent.click(removeButton)
    expect(mockDeleteButton).toHaveBeenCalled()
    expect(mockDeleteButton).toHaveBeenCalledTimes(1)
  })

  it('should render with no edit button', () => {
    const props: RenderImageProps = {
      contentId: '01',
      contentType: 'image',
      contentSrc: '',
      allowEdit: false,
      onDelete: jest.fn(),
    }
    renderComponent(props)

    const removeButton = screen.queryByTestId('del-media-button')
    expect(removeButton).not.toBeInTheDocument()
  })
})
