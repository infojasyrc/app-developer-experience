import React, { Component } from 'react'
import {
  withStyles,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Table,
} from '@material-ui/core'
import Moment from 'moment'
import DownloadIcon from '@material-ui/icons/CloudDownload'

import Loading from './Loading/Loading'
import NavigationLayout from '../hocs/NavigationLayout'
import EventsApi from '../shared/api/endpoints/events'
import AttendeesApi from '../shared/api/endpoints/attendees'
import { withMessage } from '../hocs/Snackbar'

const styles = (theme) => ({
  yearsSelector: {
    textAlign: 'right',
    marginBottom: '0',
  },
})

class ExportAttendees extends Component {
  constructor(props) {
    super(props)

    this.state = {
      events: [],
      selectedYear: new Date().getFullYear(),
      selectableYears: [],
      isLoading: false,
    }

    this.api = new EventsApi()
    this.attendeesApi = new AttendeesApi()
  }

  fetchData = () => {
    const { selectedYear } = this.state
    const { showLoading, hideMessage } = this.props

    this.setState(
      {
        isLoading: true,
      },
      () => {
        showLoading()
      }
    )

    this.api
      .getAllWithAttendees(selectedYear)
      .then((events) => {
        this.setState(
          {
            isLoading: false,
            events: events,
          },
          () => {
            hideMessage()
          }
        )
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error while getting events with attendees', error)
        this.setState(
          {
            isLoading: false,
            events: [],
          },
          () => {
            hideMessage()
          }
        )
      })
  }

  setSelectableYears = () => {
    const { selectedYear } = this.state
    const currentYear = selectedYear
    const nextYear = currentYear + 1
    const pastYear = currentYear - 1

    const { selectableYears } = this.state

    selectableYears.push(nextYear, currentYear, pastYear)

    this.setState({ selectableYears, selectedYear: currentYear })
  }

  componentDidMount() {
    this.setSelectableYears()
    this.fetchData()
  }

  handleDownloadClicked = (id, name) => {
    const { showMessage, hideMessage } = this.props

    this.setState({ isLoading: true })
    showMessage('Downloading CSV')

    this.attendeesApi
      .download(id, name)
      .then(() => {
        this.setState(
          {
            isLoading: false,
          },
          () => {
            hideMessage()
          }
        )
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error while downloading attendees', error)
        this.setState({ isLoading: false }, () => {
          hideMessage()
        })
      })
  }

  handleYearChanged = (e) => {
    this.setState(
      {
        selectedYear: e.target.value,
      },
      () => {
        this.fetchData()
      }
    )
  }

  getFormattedDate = (date) => {
    return Moment(date, 'yyyy-MM-DD hh:mm:ss.SSS').format('MM/DD/YYYY hh:mm')
  }

  renderYears = () => {
    const { selectableYears, selectedYear } = this.state

    const items = selectableYears.map((year, index) => {
      return (
        <MenuItem key={index} value={year}>
          {year}
        </MenuItem>
      )
    })

    return (
      <FormControl>
        <Select
          value={selectedYear}
          onChange={this.handleYearChanged}
          inputProps={{
            name: 'select-year',
            id: 'select-year',
          }}
        >
          {items}
        </Select>
      </FormControl>
    )
  }

  renderRows = () => {
    const { events } = this.state

    if (!events || events.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            <strong>No Results found</strong>
          </TableCell>
        </TableRow>
      )
    }

    return events.map((event, index) => {
      return (
        <TableRow key={index}>
          <TableCell>{event.headquarter.name}</TableCell>
          <TableCell>{event.name}</TableCell>
          <TableCell>{this.getFormattedDate(event.date)}</TableCell>
          <TableCell>{event.status}</TableCell>
          <TableCell>{event.attendees.length}</TableCell>
          <TableCell>
            <IconButton
              onClick={() => {
                this.handleDownloadClicked(event.id, event.name)
              }}
            >
              <DownloadIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      )
    })
  }

  renderTable = () => {
    const { isLoading } = this.state

    if (isLoading) {
      return <Loading isLoading={true} />
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>HQ</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell># Attendees</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{this.renderRows()}</TableBody>
      </Table>
    )
  }

  render() {
    const { classes } = this.props

    return (
      <NavigationLayout title="Export attendees">
        <Grid container>
          <Grid container direction="row">
            <Grid item xs={10}>
              <h1>Export attendees</h1>
            </Grid>
            <Grid className={classes.yearsSelector} item xs={2}>
              {this.renderYears()}
            </Grid>
          </Grid>
          <Grid container direction="row">
            <Grid item xs>
              {this.renderTable()}
            </Grid>
          </Grid>
        </Grid>
      </NavigationLayout>
    )
  }
}

export default withMessage(withStyles(styles)(ExportAttendees))
