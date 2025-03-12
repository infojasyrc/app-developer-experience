import { render, screen } from '@testing-library/react'

import ConferenceStatusSection, {
  ConferenceStatusSectionProps,
} from './ConferenceStatusSection'

const renderComponent = (props: ConferenceStatusSectionProps) =>
  render(<ConferenceStatusSection {...props} />)

describe('conference status component', () => {
  it('should render for created', () => {
    const props: ConferenceStatusSectionProps = {
      status: 'created',
    }
    renderComponent(props)

    // TODO: this unit test should be validate specific classes for the component
    expect(screen.getByTestId('conference-status-section')).toBeInTheDocument()
  })

  it('should render for opened', () => {
    const props: ConferenceStatusSectionProps = {
      status: 'opened',
    }
    renderComponent(props)

    // TODO: this unit test should be validate specific classes for the component
    expect(screen.getByTestId('conference-status-section')).toBeInTheDocument()
  })

  it('should render for paused', () => {
    const props: ConferenceStatusSectionProps = {
      status: 'paused',
    }
    renderComponent(props)

    // TODO: this unit test should be validate specific classes for the component
    expect(screen.getByTestId('conference-status-section')).toBeInTheDocument()
  })

  it('should render for closed', () => {
    const props: ConferenceStatusSectionProps = {
      status: 'closed',
    }
    renderComponent(props)

    // TODO: this unit test should be validate specific classes for the component
    expect(screen.getByTestId('conference-status-section')).toBeInTheDocument()
  })
})
