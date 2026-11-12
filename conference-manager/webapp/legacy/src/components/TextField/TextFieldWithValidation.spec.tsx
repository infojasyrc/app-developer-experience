import { render, screen } from '@testing-library/react'

import TextFieldWithValidation, {
  TextFieldWithValidationProps,
} from './TextFieldWithValidation'

const renderComponent = (props: TextFieldWithValidationProps) =>
  render(<TextFieldWithValidation {...props} />)

describe('textfield with validation component', () => {
  it('should render no error', () => {
    const props: TextFieldWithValidationProps = {
      id: 'textfield',
      className: '',
      value: '',
      name: '',
      label: 'Label No error',
      required: true,
      error: false,
      helperText: '',
    }
    renderComponent(props)
    const text = screen.getByText(/label no error/i)
    expect(text).toBeInTheDocument()
  })

  it('should render with error', () => {
    const props: TextFieldWithValidationProps = {
      id: 'textfield',
      className: '',
      value: '',
      name: '',
      label: 'Label with error',
      required: true,
      error: true,
      helperText: 'This is an error',
    }
    renderComponent(props)
    const text = screen.getByText(/label with error/i)
    expect(text).toBeInTheDocument()
  })
})
