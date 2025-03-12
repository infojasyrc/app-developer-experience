import React, { Component } from 'react'
import LayoutContext, { LayoutTypes } from '../shared/contexts/LayoutContext'

class NavigationLayout extends Component {
  componentDidMount() {
    const { changeLayout } = this.context
    const { title, showLogo } = this.props
    changeLayout(LayoutTypes.NAVIGATION, title, showLogo)
  }

  render() {
    const { children } = this.props
    return <React.Fragment>{children}</React.Fragment>
  }
}
NavigationLayout.contextType = LayoutContext

export default NavigationLayout
