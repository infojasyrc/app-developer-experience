import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import {
  Avatar,
  Checkbox,
  FormControlLabel,
  IconButton,
  withStyles,
  Grid,
} from '@material-ui/core'
import AccountCircleIcon from '@material-ui/icons/AccountCircleRounded'

import FormButtons from './FormButtons/FormButtons'
import NavigationLayout from '../hocs/NavigationLayout'
import { withMessage } from '../hocs/Snackbar'
import { styles } from '../styles/CreateUpdateUser'

import UsersApi from '../shared/api/endpoints/users'
import RolesApi from '../shared/api/endpoints/roles'
import ImagesApi from '../shared/api/endpoints/images'
import SelectWithLoading from './DropDown/SelectWithLoading'
import { withUserContext } from '../hocs/UserContext'
import { getBase64, validateEmail } from '../shared/tools'
import TextFieldWithValidation from './TextField/TextFieldWithValidation'

class CreateUpdateUser extends Component {
  constructor(props) {
    super(props)

    this.state = {
      id: null,
      email: '',
      name: '',
      lastName: '',
      avatarUrl: null,
      isAdmin: false,
      role: '',
      avatarFile: null,
      avatarPreview: null,
      loading: false,
      error: null,
      roles: null,
      validation: {
        name: {
          error: false,
          message: 'You should provide a Name',
        },
        lastName: {
          error: false,
          message: 'You should provide a Last Name',
        },
        email: {
          error: false,
          message: 'You should provide a valid E-mail',
        },
        role: {
          error: false,
          message: 'You must select a Role',
        },
      },
      enableSave: false,
    }

    this.api = new UsersApi()
    this.rolesApi = new RolesApi()
    this.imagesApi = new ImagesApi()
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    const { isAdding, showLoading, showError, hideMessage } = this.props

    hideMessage()
    showLoading()

    this.setState({ loading: true })

    if (isAdding) {
      this.rolesApi
        .getAll()
        .then((roles) => {
          this.setState(
            {
              roles,
              loading: false,
            },
            () => {
              hideMessage()
            }
          )
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error)

          hideMessage()
          showError(error.message ? error.message : 'Error while loading data.')

          this.setState({ loading: true })
        })

      return
    }

    const { match } = this.props

    const id = match.params.id

    Promise.all([this.rolesApi.getAll(), this.api.getById(id)])
      .then((results) => {
        const roles = results[0]
        const user = results[1]

        this.setState(
          {
            roles: roles,
            id: user.id,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            isAdmin: user.isAdmin,
            role: user.role.id,
            loading: false,
          },
          () => {
            hideMessage()
          }
        )
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error)

        hideMessage()
        showError(error.message ? error.message : 'Error while loading user.')

        this.setState({ loading: false })
      })
  }

  handleTextChanged = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  handleSelectedFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    this.setState({ enableSave: false })

    getBase64(file)
      .then((result) => {
        this.setState({ avatarFile: file, avatarPreview: result })
      })
      .finally(() => {
        this.setState({ enableSave: true })
      })
  }

  handleRoleChanged = (e) => {
    this.setState({ role: e.target.value })
  }

  handleIsAdminChanged = (e) => {
    this.setState({ isAdmin: e.target.checked })
  }

  handleRequiredFieldBlurred = (e) => {
    const { validation } = this.state
    validation[e.target.name].error = !e.target.value || e.target.value === ''

    if (e.target.id === 'email' && e.target.value.length > 0) {
      validation[e.target.name].error = !validateEmail(e.target.value)
    }
    const enableSave = this.checkValidation()
    this.setState({ validation, enableSave })
  }

  checkValidation = () => {
    const { email, name, lastName, role, validation } = this.state

    if (!email || email.trim() === '') {
      return false
    }

    if (!name || name.trim() === '') {
      return false
    }

    if (!lastName || lastName.trim() === '') {
      return false
    }

    if (!role || role.trim() === '') {
      return false
    }

    for (let key in validation) {
      if (!validation.hasOwnProperty(key)) {
        continue
      }

      if (validation[key].error) {
        return false
      }
    }

    return true
  }

  goBack = () => {
    const { history } = this.props
    history.push('/users')
  }

  addUser = (userData, showError, hideMessage) => {
    this.api
      .add(userData)
      .then(() => {
        hideMessage()
        this.goBack()
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error while adding user', error)
        hideMessage()
        showError(error.message ? error.message : 'Error while adding user')
      })
  }

  updateUser = (userData, showError, hideMessage) => {
    this.api
      .update(userData)
      .then(() => {
        hideMessage()
        this.goBack()
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error while updating user', error)
        hideMessage()
        showError(error.message ? error.message : 'Error while updating user')
      })
  }

  handleSaveClicked = () => {
    const { id, email, name, lastName, isAdmin, role, avatarFile, roles } =
      this.state

    const { isAdding, showSaving, showError, hideMessage } = this.props

    showSaving()

    const selectedRoleIdx = roles.findIndex((r) => {
      return r.id === role
    })

    let userData = {
      email: email,
      name: name,
      lastName: lastName,
      isAdmin: isAdmin,
      role: roles[selectedRoleIdx],
    }

    if (isAdding) {
      if (avatarFile) {
        this.imagesApi.add({ id, images: [avatarFile] }).then((result) => {
          userData.avatarUrl = result.data.data[0].url
          this.addUser(userData, showError, hideMessage)
        })
        return
      } else {
        this.addUser(userData, showError, hideMessage)
        return
      }
    }

    userData.id = id

    if (avatarFile) {
      this.imagesApi.add({ id, images: [avatarFile] }).then((result) => {
        userData.avatarUrl = result.data.data[0].url
        this.updateUser(userData, showError, hideMessage)
      })
      return
    }

    this.updateUser(userData, showError, hideMessage)
  }

  handleCancelButton = () => {
    this.props.history.push('/users')
  }

  renderImageSelector = (avatarUrl) => {
    const { classes } = this.props
    const { avatarPreview } = this.state

    if (avatarPreview) {
      return (
        <IconButton
          className={classes.avatarButton}
          variant="contained"
          component="label"
        >
          <Avatar className={classes.avatar} alt="user" src={avatarPreview} />
          <input
            type="file"
            style={{
              display: 'none',
            }}
            onChange={this.handleSelectedFile}
          />
        </IconButton>
      )
    }

    if (avatarUrl) {
      return (
        <IconButton
          className={classes.avatarButton}
          variant="contained"
          component="label"
        >
          <Avatar className={classes.avatar} alt="user" src={avatarUrl} />
          <input
            type="file"
            style={{
              display: 'none',
            }}
            onChange={this.handleSelectedFile}
          />
        </IconButton>
      )
    }

    return (
      <IconButton
        className={classes.avatarButton}
        variant="contained"
        component="label"
      >
        <AccountCircleIcon className={classes.avatar} />
        <input
          type="file"
          style={{
            display: 'none',
          }}
          onChange={this.handleSelectedFile}
        />
      </IconButton>
    )
  }

  renderRoles = () => {
    const { role, roles, validation } = this.state
    return (
      <SelectWithLoading
        attributeValue={role ? role : ''}
        attributeRequired={true}
        attributeOptions={roles}
        attributeName="role"
        attributeLabel="Role"
        error={validation.role.error}
        errorMessage={validation.role.message}
        onChange={this.handleRoleChanged}
        onBlur={this.handleRequiredFieldBlurred}
      />
    )
  }

  renderSaveButton = () => {
    const { userContext } = this.props
    const { isAdmin } = userContext.user

    const { enableSave } = this.state

    if (!isAdmin) {
      return null
    }

    return (
      <FormButtons
        enableSave={enableSave}
        onSaveClick={this.handleSaveClicked}
        onCancelClick={this.handleCancelButton}
      ></FormButtons>
    )
  }

  render() {
    const { isAdding, classes } = this.props
    const { email, name, lastName, avatarUrl, isAdmin, validation } = this.state
    const title = isAdding ? 'Add user' : 'Edit user'

    return (
      <NavigationLayout title={title}>
        <Grid container>
          <Grid item xs={12}>
            {this.renderImageSelector(avatarUrl)}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextFieldWithValidation
              className={[classes.textField, classes.wideInput].join(' ')}
              id="name"
              name="name"
              label="Name"
              value={name}
              required={true}
              error={validation.name.error}
              helperText={validation.name.message}
              onChange={this.handleTextChanged}
              onBlur={this.handleRequiredFieldBlurred}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextFieldWithValidation
              className={[classes.textField, classes.wideInput].join(' ')}
              id="lastName"
              name="lastName"
              label="Last Name"
              value={lastName}
              required={true}
              error={validation.lastName.error}
              helperText={validation.lastName.message}
              onChange={this.handleTextChanged}
              onBlur={this.handleRequiredFieldBlurred}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextFieldWithValidation
              className={[classes.textField, classes.wideInput].join(' ')}
              id="email"
              name="email"
              label="E-Mail"
              value={email}
              required={true}
              error={validation.email.error}
              helperText={validation.email.message}
              onChange={this.handleTextChanged}
              onBlur={this.handleRequiredFieldBlurred}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            {this.renderRoles()}
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAdmin}
                  onChange={this.handleIsAdminChanged}
                />
              }
              label="Is Admin"
            />
          </Grid>
        </Grid>
        {this.renderSaveButton()}
      </NavigationLayout>
    )
  }
}

export default withMessage(
  withUserContext(withRouter(withStyles(styles)(CreateUpdateUser)))
)
