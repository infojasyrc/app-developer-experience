import { render, screen } from '@testing-library/react'

import SelecWithLoading, { SelectWithLoadingProps } from './SelectWithLoading'

const renderComponent = (props: SelectWithLoadingProps) =>
  render(<SelecWithLoading {...props} />)

describe('select with loading component', () => {
  it('should render all elements', () => {
    const props: SelectWithLoadingProps = {
      attributeName: 'dropdown-with-loader',
      attributeLabel: 'Dropdown With Loader',
      attributeValue: '',
      attributeRequired: true,
      attributeOptions: [],
      error: false,
      errorMessage: '',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      isLoading: false,
    }
    renderComponent(props)
    const selectWithLoader = screen.getByTestId('select-with-loader')
    expect(selectWithLoader).toBeInTheDocument()
  })

  it('should render all elements with loader', () => {
    const props: SelectWithLoadingProps = {
      attributeName: 'dropdown-with-loader',
      attributeLabel: 'Dropdown With Loader',
      attributeValue: '',
      attributeRequired: true,
      attributeOptions: [
        { id: 'piura', name: 'Piura' },
        { id: 'lima', name: 'Lima' },
      ],
      error: false,
      errorMessage: '',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      isLoading: true,
    }
    renderComponent(props)

    const loaderWrapper = screen.getByTestId('loader-wrapper')
    const selectWithLoader = screen.getByTestId('select-with-loader')

    expect(loaderWrapper).toBeInTheDocument()
    expect(selectWithLoader).toBeInTheDocument()
  })

  it('should render all elements with error', () => {
    const props: SelectWithLoadingProps = {
      attributeName: 'dropdown-with-loader',
      attributeLabel: 'Dropdown With Loader',
      attributeValue: '',
      attributeRequired: true,
      attributeOptions: [
        { id: 'piura', name: 'Piura' },
        { id: 'lima', name: 'Lima' },
      ],
      error: true,
      errorMessage: 'This is an error',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      isLoading: false,
    }
    renderComponent(props)

    const helperTextError = screen.getByTestId('helper-select-with-loadding-error')
    const selectWithLoader = screen.getByTestId('select-with-loader')

    expect(helperTextError).toBeInTheDocument()
    expect(selectWithLoader).toBeInTheDocument()
  })
})
