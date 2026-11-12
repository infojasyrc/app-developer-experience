import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/react'

import CustomDropdown, { CustomDropdownProps } from './CustomDropdown'

const renderComponent = (props: CustomDropdownProps) =>
  render(<CustomDropdown {...props} />)

const props: CustomDropdownProps = {
  elements: [
    { key: '2022', label: '2022' },
    { key: '2023', label: '2023' },
    { key: '2024', label: '2024' },
  ],
  title: 'Year',
  onChange: jest.fn(),
}

describe('year filter component', () => {
  it('should render all filter', () => {
    renderComponent(props)

    const elementHTML = screen.getByRole('button')
    expect(elementHTML).toBeInTheDocument()

    fireEvent.mouseDown(elementHTML)
    const listbox = within(screen.getByRole('listbox'))

    expect(screen.getAllByRole('option').length).toBe(3)
    expect(listbox.getByText(/2023/i)).toBeInTheDocument()
    expect(listbox.getByText(/2022/i)).toBeInTheDocument()
    expect(listbox.getByText(/2024/i)).toBeInTheDocument()
  })

  it('should render selected filter', () => {
    const mockOnChange = jest.fn()
    renderComponent(props)

    const element = screen.getByRole('button')
    fireEvent.mouseDown(element)
    const listbox = within(screen.getByRole('listbox'))
    fireEvent.click(listbox.getByText(/2022/i))

    waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent(/2022/i)
      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })
})
