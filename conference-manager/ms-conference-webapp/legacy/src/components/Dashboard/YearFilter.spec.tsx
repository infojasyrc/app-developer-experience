import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from '@testing-library/react'

import YearFilter, { YearFilterProps } from './YearFilter'

const renderComponent = (props: YearFilterProps) => render(<YearFilter {...props} />)

describe('year filter component', () => {
  it('should render all filter', () => {
    const props: YearFilterProps = {
      onChange: jest.fn(),
    }
    renderComponent(props)

    const element = screen.getByRole('button')
    expect(element).toBeInTheDocument()

    fireEvent.mouseDown(element)
    const listbox = within(screen.getByRole('listbox'))
    
    expect(screen.getByText(/Year/)).toBeInTheDocument()
    expect(screen.getAllByRole('option').length).toBe(3)
    expect(listbox.getByText(/2023/i)).toBeInTheDocument()
    expect(listbox.getByText(/2024/i)).toBeInTheDocument()
    expect(listbox.getByText(/2025/i)).toBeInTheDocument()
  })

  it('should render selected filter', () => {
    const mockOnChange = jest.fn()
    const props: YearFilterProps = {
      onChange: mockOnChange,
    }
    renderComponent(props)

    const element = screen.getByRole('button')
    fireEvent.mouseDown(element)
    const listbox = within(screen.getByRole('listbox'))
    fireEvent.click(listbox.getByText(/2023/i))

    waitFor(() => {
      expect(screen.getByRole('button')).toHaveTextContent(/2023/i)
      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })
})
