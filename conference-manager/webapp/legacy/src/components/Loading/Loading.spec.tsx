import { render, screen } from '@testing-library/react'

import Loading, { LoadingProps } from './Loading'

const renderComponent = (props: LoadingProps) => render(<Loading {...props} />)

describe('loading component', () => {
  it('should render element with loading', () => {
    const props: LoadingProps = {
      isLoading: true
    }
    renderComponent(props)
    const loaderSection = screen.getByTestId('loader')
    expect(loaderSection).toBeInTheDocument()
  })

  it('should show an empty element', () => {
    const props: LoadingProps = {
      isLoading: false
    }
    renderComponent(props)
    const loaderSection = screen.queryByTestId('loader')
    expect(loaderSection).not.toBeInTheDocument()
  })
})
