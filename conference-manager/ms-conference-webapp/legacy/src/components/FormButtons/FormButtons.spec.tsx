import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import FormButtons, { FormButtonsProps } from './FormButtons'

const renderComponent = (props: FormButtonsProps) =>
  render(<FormButtons {...props} />)

describe('form buttons component', () => {
  it('should render all elements', () => {
    const props: FormButtonsProps = {
      disableMainButton: false,
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
    }
    renderComponent(props)
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    const saveButton = screen.getByRole('button', { name: /save/i })

    expect(cancelButton).toBeInTheDocument()
    expect(saveButton).toBeInTheDocument()
  })

  it('should submit on save', () => {
    const mockOnSubmit = jest.fn()
    const props: FormButtonsProps = {
      disableMainButton: false,
      onSubmit: mockOnSubmit,
      onCancel: jest.fn(),
    }
    renderComponent(props)

    const saveButton = screen.getByRole('button', { name: /save/i })
    expect(saveButton).toBeInTheDocument()

    userEvent.click(saveButton)

    expect(mockOnSubmit).toHaveBeenCalled()
    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  it('should call on cancel', () => {
    const mockOnCancel = jest.fn()
    const props: FormButtonsProps = {
      disableMainButton: false,
      onSubmit: jest.fn(),
      onCancel: mockOnCancel,
    }
    renderComponent(props)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    expect(cancelButton).toBeInTheDocument()

    userEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })
})
