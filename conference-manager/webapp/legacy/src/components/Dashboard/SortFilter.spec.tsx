import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'

import SortFilter, { SortFilterProps } from './SortFilter'

const props: SortFilterProps = {
  onChange: jest.fn(),
}
const renderComponent = (props: SortFilterProps) =>
  render(<SortFilter {...props} />)

describe('sort filter', () => {
  it('should render all filters', () => {
    renderComponent(props)

    const element = screen.getByRole('button')
    expect(element).toBeInTheDocument()

    fireEvent.mouseDown(element)
    const listbox = within(screen.getByRole('listbox'))

    expect(screen.getAllByRole('option').length).toBe(2)
    expect(listbox.getByText(/ascending/i)).toBeInTheDocument()
    expect(listbox.getByText(/descending/i)).toBeInTheDocument()
  })

  it('should render selected filter', () => {
    const mockOnChange = jest.fn()
    const props: SortFilterProps = {
      onChange: mockOnChange,
    }
    renderComponent(props)

    const element = screen.getByRole('button')
    fireEvent.mouseDown(element)
    const listbox = within(screen.getByRole('listbox'))
    fireEvent.click(listbox.getByText(/ascending/i))

    waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent(/ascending/i)
      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })
})
