import { render, screen } from '@testing-library/react'

import LoadingWrapper, { LoadingWrapperProps } from './LoadingWrapper'

const renderComponent = (props: LoadingWrapperProps) =>
  render(<LoadingWrapper {...props} />)

describe('loading wrapper component', () => {
  it('should render all elements', () => {
    const component = '<div className="container"><p>Element Test</p><div/>'
    const props: LoadingWrapperProps = {
      isLoading: true,
      middlePosition: {top: '30px', left: '190px'},
      children: component
    }
    renderComponent(props)
    const loaderSection = screen.getByTestId('loader-wrapper')
    expect(loaderSection).toBeInTheDocument()
  })

  it('should render with no loader', () => {
    const component = '<div className="container"><p>Element Test</p><div/>'
    const props: LoadingWrapperProps = {
      isLoading: false,
      middlePosition: {top: '30px', left: '190px'},
      children: component
    }
    renderComponent(props)
    const loaderSection = screen.queryByTestId('loader-wrapper')
    expect(loaderSection).not.toBeInTheDocument()
  })
})
