import React, { Component } from 'react'
import LayoutContext, { LayoutTypes } from '../shared/contexts/LayoutContext'

class FullLayout extends Component {
  componentDidMount() {
    const { changeLayout } = this.context
    const { title } = this.props
    changeLayout(LayoutTypes.FULL, title)
  }

  render() {
    const { children } = this.props
    return <React.Fragment>{children}</React.Fragment>
  }
}

FullLayout.contextType = LayoutContext

export default FullLayout
