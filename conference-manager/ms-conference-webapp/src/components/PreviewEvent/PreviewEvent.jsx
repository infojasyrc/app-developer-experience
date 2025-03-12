import React, { Component } from 'react'
import {
  withStyles,
  Dialog,
  DialogTitle,
  Grid,
  DialogActions,
  DialogContent,
} from '@material-ui/core'

import ImagesPreview from '../ImagesPreview/ImagesPreview'
import PreviewActions from './PreviewActions'

import Moment from 'moment'

import database from '../../database/database'
import DataService from '../../database/dataService'

import { colors } from '../../styles/theme/colors'

const styles = () => ({
  title: {
    color: colors.orange,
    fontFamily: 'Exo',
    fontSize: '3em',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: '2em',
  },
  row: {
    marginBottom: '1em',
  },
  label: {
    fontSize: '1em',
    fontWeight: 'bold',
    display: 'block',
  },
})

class PreviewEvent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      canSynchronize: false,
    }

    this.db = new DataService(database, 'attendees')
  }

  componentDidMount() {
    const { event } = this.props
    this.db
      .countByKey('idEvent', event.id)
      .then((result) => {
        if (result <= 0) {
          return
        }

        this.setState({ canSynchronize: true })
      })
      .catch((error) => {
        console.error('Error while counting number of attendees', error)
      })
  }

  render() {
    const {
      classes,
      event,
      onPreviewClose,
      onOpen,
      onPause,
      onEnter,
      onSynchronize,
      onClose,
    } = this.props

    if (!event) {
      return null
    }

    const date = Moment(event.date, 'YYYY-MM-DDThh:mm:ss')

    return (
      <Dialog open={true} onClose={onPreviewClose} maxWidth="lg" fullWidth>
        <DialogTitle disableTypography className={classes.title}>
          {event.name}
        </DialogTitle>
        <DialogContent>
          <Grid container className={classes.contentContainer}>
            <Grid container direction="row" className={classes.row}>
              <Grid item xs={6}>
                <label className={classes.label}>Date</label>
                <label>{date.format('D MMM YYYY')}</label>
              </Grid>
              <Grid item xs={6}>
                <label className={classes.label}>Time</label>
                <label>{date.format('hh:mm')}</label>
              </Grid>
            </Grid>
            <Grid container direction="row" className={classes.row}>
              <Grid item xs={6}>
                <label className={classes.label}>Responsable</label>
                <label>{event.responsable.name}</label>
              </Grid>
              <Grid item xs={6}>
                <label className={classes.label}>Place</label>
                <label>{event.placeName}</label>
              </Grid>
            </Grid>
            <Grid container direction="row" className={classes.row}>
              <Grid item xs={6}>
                <label className={classes.label}>Address</label>
                <label>{event.address}</label>
              </Grid>
              <Grid item xs={6}>
                <label className={classes.label}>Phone</label>
                <label>{event.phoneNumber}</label>
              </Grid>
            </Grid>
            <Grid container direction="row" className={classes.row}>
              <ImagesPreview images={event.images} enableEdit={false} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <PreviewActions
            conferenceId={event.id}
            status={event.status}
            onOpen={onOpen}
            onPause={onPause}
            onClose={onClose}
            onEnter={onEnter}
            onSynchronize={onSynchronize}
          />
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(styles)(PreviewEvent)
