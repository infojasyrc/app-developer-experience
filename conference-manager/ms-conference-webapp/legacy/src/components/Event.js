import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import { withStyles, Button } from '@material-ui/core'

import LayoutContext from '../shared/contexts/LayoutContext'
import NoneLayout from '../hocs/NoneLayout'
import EventsApi from '../shared/api/endpoints/events'
import Loading from './Loading/Loading'
import Slider from './Slider/Slider'
import { withMessage } from '../hocs/Snackbar'

const styles = (theme) => ({
  container: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  exitButton: {
    position: 'absolute',
    width: '90%',
    top: 0,
    left: '5%',
    height: '3em',
    zIndex: 3,
  },
})

class Event extends Component {
  constructor(props) {
    super(props)

    this.state = {
      event: null,
    }

    this.api = new EventsApi()
  }

  componentDidMount = () => {
    const { match, showLoading, hideMessage } = this.props
    const id = match.params.id

    showLoading()

    this.api
      .getById(id)
      .then((event) => {
        this.setState(
          {
            event: event,
          },
          () => {
            hideMessage()
          }
        )
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        hideMessage()
      })
  }

  handleFormClicked = () => {
    const { history, match } = this.props
    history.push(`/add-attendee/${match.params.id}`)
  }

  handleBackClicked = () => {
    const { history } = this.props
    history.push('/')
  }

  renderContent = (event) => {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <img
          className={classes.image}
          src={event.images[0].url}
          alt={event.name}
        />
      </div>
    )
  }

  render() {
    const { event } = this.state
    const { classes } = this.props

    if (!event) {
      return (
        <NoneLayout>
          <Loading isLoading={true} />
          <Button
            className={classes.exitButton}
            onClick={this.handleBackClicked}
          >
            {''}
          </Button>
        </NoneLayout>
      )
    }

    return (
      <NoneLayout>
        <Slider
          images={event.images}
          startPaused={false}
          onFormClicked={this.handleFormClicked}
        />
        <Button className={classes.exitButton} onClick={this.handleBackClicked}>
          {''}
        </Button>
      </NoneLayout>
    )
  }
}
Event.contextType = LayoutContext

export default withMessage(withRouter(withStyles(styles)(Event)))
