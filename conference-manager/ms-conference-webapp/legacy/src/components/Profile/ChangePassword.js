import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { withStyles, Grid } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'

import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

import FormButtons from './../FormButtons/FormButtons'
import NavigationLayout from './../../hocs/NavigationLayout'
import { withMessage } from './../../hocs/Snackbar'

import { withUserContext } from './../../hocs/UserContext'

import UsersApi from '../../shared/api/endpoints/users'

import { styles } from './../../styles/ChangePassword'

class ChangePassword extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      enableSave: false,
    }

    this.api = new UsersApi()
  }

  handleChange = (event) => {
    this.setState({ [event.target.id]: event.target.value })
  }

  validatePasswordFields = () => {
    const { currentPassword, newPassword, confirmPassword } = this.state

    return (
      currentPassword.length > 3 &&
      newPassword.length > 3 &&
      confirmPassword > 3 &&
      newPassword === confirmPassword
    )
  }

  handleRequiredFieldBlurred = () => {
    if (this.validatePasswordFields()) {
      this.setState({ enableSave: true })
    } else {
      this.setState({ enableSave: false })
    }
  }

  handleClickShowCurrentPassword = () => {
    const { showCurrentPassword } = this.state
    this.setState({ showCurrentPassword: !showCurrentPassword })
  }

  handleClickShowNewPassword = () => {
    const { showNewPassword } = this.state
    this.setState({ showNewPassword: !showNewPassword })
  }

  handleClickShowConfirmPassword = () => {
    const { showConfirmPassword } = this.state
    this.setState({ showConfirmPassword: !showConfirmPassword })
  }

  goBack = () => {
    this.props.history.push('/')
  }

  handleSaveClicked = () => {
    const { showMessage, showError, hideMessage, userContext } = this.props
    const { currentPassword, newPassword, confirmPassword } = this.state

    const userData = {
      id: userContext.user.id,
      uid: userContext.user.uid,
      oldPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: confirmPassword,
    }

    showMessage('Changing password')

    this.api
      .changePassword(userData)
      .then((response) => {
        hideMessage()
        this.goBack()
      })
      .catch((error) => {
        hideMessage()
        const messageError = 'Error while updating user'
        // eslint-disable-next-line no-console
        console.error(messageError, error)
        showError(messageError)
      })
      .finally(() => {
        hideMessage()
      })
  }

  handleCancelButton = () => {
    this.goBack()
  }

  render() {
    const { classes } = this.props
    const {
      currentPassword,
      newPassword,
      confirmPassword,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      enableSave,
    } = this.state

    return (
      <NavigationLayout title="Change Password">
        <Grid
          container
          justify="center"
          alignItems="center"
          className={classes.rootContainer}
        >
          <Grid item xs={12} container direction="column">
            <TextField
              id="currentPassword"
              className={classes.textField}
              variant="standard"
              type={showCurrentPassword ? 'text' : 'password'}
              label="Current Password"
              value={currentPassword}
              onChange={this.handleChange}
              onBlur={this.handleRequiredFieldBlurred}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label="Toggle password visibility"
                      onClick={this.handleClickShowCurrentPassword}
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} container direction="column">
            <TextField
              id="newPassword"
              className={classes.textField}
              variant="standard"
              type={showNewPassword ? 'text' : 'password'}
              label="New Password"
              value={newPassword}
              onChange={this.handleChange}
              onBlur={this.handleRequiredFieldBlurred}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label="Toggle password visibility"
                      onClick={this.handleClickShowNewPassword}
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} container direction="column">
            <TextField
              id="confirmPassword"
              className={classes.textField}
              variant="standard"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              value={confirmPassword}
              onChange={this.handleChange}
              onBlur={this.handleRequiredFieldBlurred}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      aria-label="Toggle password visibility"
                      onClick={this.handleClickShowConfirmPassword}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        <FormButtons
          enableSave={enableSave}
          onSaveClick={this.handleSaveClicked}
          onCancelClick={this.handleCancelButton}
        ></FormButtons>
      </NavigationLayout>
    )
  }
}

export default withMessage(
  withUserContext(withRouter(withStyles(styles)(ChangePassword)))
)
