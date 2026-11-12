import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { withStyles, Grid, MenuItem, Select } from '@material-ui/core'

import { withMessage } from '../../hocs/Snackbar'
import { withUserContext } from '../../hocs/UserContext'

import HeadquartersApi from '../../shared/api/endpoints/headquarters'

import { styles } from '../../styles/Headquarters'

class Headquarters extends Component {
  constructor(props) {
    super(props)
    this.state = {
      allHeadquarters: [],
      selectedHeadquarter: null,
    }
    this.apiHeadquarters = new HeadquartersApi()
  }

  componentDidMount() {
    this.setState({
      selectedHeadquarter: this.props.userContext.selectedHeadquarter,
    })
    this.fetchData()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.selectedHeadquarter !== this.state.selectedHeadquarter) {
      this.props.changeHeadquarter(this.state.selectedHeadquarter)
    }
  }

  fetchData = () => {
    const { allHeadquarters, selectedHeadquarter } = this.state
    const { showError, hideMessage } = this.props

    if (allHeadquarters.length > 0) {
      return
    }

    this.apiHeadquarters
      .getAll()
      .then((headquarters) => {
        if (headquarters.length > 0) {
          const hq = selectedHeadquarter
            ? selectedHeadquarter
            : headquarters[0].id

          this.setState(
            {
              allHeadquarters: headquarters,
              selectedHeadquarter: hq,
            },
            () => {
              this.props.userContext.selectHeadquarter(hq)
            }
          )
        } else {
          showError(
            'No Internet connectivity available and no data has been cached. ' +
              'Please execute the app up to the slider of the event that you desire to ' +
              'access offline.'
          )
        }
      })
      .catch((error) => {
        showError('Error retrieving all headquarters')
        // eslint-disable-next-line no-console
        console.error(error)
      })
      .finally(() => {
        hideMessage()
      })
  }

  handleHeadquarterChanged = (e) => {
    this.setState({
      selectedHeadquarter: e.target.value,
    })
  }

  render() {
    const { allHeadquarters, selectedHeadquarter } = this.state
    const { classes } = this.props

    if (!allHeadquarters || allHeadquarters.length === 0) {
      return <h4>Loading HQs</h4>
    }

    const items = allHeadquarters.map((headquarter, index) => {
      return (
        <MenuItem key={index} value={headquarter.id}>
          {headquarter.name}
        </MenuItem>
      )
    })

    return (
      <Grid item xs={10} sm={8}>
        <label className={classes.headquarterFilterLabel}>Headquarter</label>
        <Select
          className={classes.headquarterSelect}
          value={selectedHeadquarter}
          inputProps={{
            name: 'hq',
            id: 'hq',
          }}
          onChange={this.handleHeadquarterChanged}
        >
          {items}
        </Select>
      </Grid>
    )
  }
}

export default withMessage(
  withUserContext(withRouter(withStyles(styles)(Headquarters)))
)
