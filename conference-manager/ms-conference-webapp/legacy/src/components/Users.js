import React, { Component } from 'react'

import {
  Avatar,
  Checkbox,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  withStyles,
  Button,
} from '@material-ui/core'
import AccountCircleIcon from '@material-ui/icons/AccountCircleRounded'
import EditIcon from '@material-ui/icons/Edit'
import DisableIcon from '@material-ui/icons/Clear'
import EnableIcon from '@material-ui/icons/Check'
import AddIcon from '@material-ui/icons/Add'

import UsersApi from '../shared/api/endpoints/users'
import { styles } from '../styles/Users'

import LayoutContext from '../shared/contexts/LayoutContext'
import NavigationLayout from '../hocs/NavigationLayout'
import Loading from './Loading/Loading'
import NavigationWrapper from './Navigation/NavigationWrapper'
import { withUserContext } from '../hocs/UserContext'
import { withMessage } from '../hocs/Snackbar'

class Users extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      users: null,
    }

    this.api = new UsersApi()
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    const { showLoading, hideMessage } = this.props

    showLoading()

    this.setState({ loading: true })

    this.api
      .getAll()
      .then((users) => {
        this.setState(
          {
            loading: false,
            users: users,
            error: null,
          },
          () => {
            hideMessage()
          }
        )
      })
      .catch((error) => {
        this.setState(
          {
            loading: false,
            users: null,
            error: error,
          },
          () => {
            hideMessage()
          }
        )
      })
  }

  toggleEnabled = (id) => {
    this.api.toggleEnabled(id).then(() => {
      this.fetchData()
    })
  }

  handleEnableUser = (id) => {
    this.setState({ isLoading: true })

    this.toggleEnabled(id)
  }

  handleDisableUser = (id) => {
    this.setState({ isLoading: true })

    this.toggleEnabled(id)
  }

  renderAddButton = () => {
    const { classes, userContext } = this.props
    const { isAdmin } = userContext.user

    if (!isAdmin) {
      return null
    }

    return (
      <NavigationWrapper path="/users/add">
        <Fab className={classes.add} color="primary">
          <AddIcon />
        </Fab>
      </NavigationWrapper>
    )
  }

  renderImage = (avatarUrl) => {
    const { classes } = this.props

    if (!avatarUrl) {
      return <AccountCircleIcon className={classes.avatar} />
    }

    return <Avatar className={classes.avatar} alt="user" src={avatarUrl} />
  }

  renderEditButton = (user) => {
    const { classes, userContext } = this.props
    const { isAdmin } = userContext.user

    if (!isAdmin) {
      return null
    }

    return (
      <NavigationWrapper path={`/users/update/${user.id}`}>
        <Button className={classes.edit}>
          <EditIcon />
        </Button>
      </NavigationWrapper>
    )
  }

  renderEnableDisableButtons = (user) => {
    const { classes, userContext } = this.props
    const { isAdmin } = userContext.user

    if (!isAdmin) {
      return null
    }

    if (user.isEnabled) {
      return (
        <Button
          className={classes.disable}
          size="small"
          onClick={() => this.handleDisableUser(user.id)}
        >
          <DisableIcon />
        </Button>
      )
    }

    return (
      <Button
        className={classes.enable}
        size="small"
        onClick={() => this.handleEnableUser(user.id)}
      >
        <EnableIcon />
      </Button>
    )
  }

  renderRows = () => {
    const { users } = this.state

    if (!users) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center">
            <strong>No Results found</strong>
          </TableCell>
        </TableRow>
      )
    }

    const { classes } = this.props

    return users.map((user) => {
      return (
        <TableRow key={user.id}>
          <TableCell>{this.renderImage(user.avatarUrl)}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{`${user.name} ${user.lastName}`}</TableCell>
          <TableCell>{user.role.name}</TableCell>
          <TableCell>
            <Checkbox checked={user.isAdmin} className={classes.isAdmin} />
          </TableCell>
          <TableCell>
            {this.renderEditButton(user)}
            {this.renderEnableDisableButtons(user)}
          </TableCell>
        </TableRow>
      )
    })
  }

  renderTable = () => {
    return (
      <React.Fragment>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Mail</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Is Admin</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{this.renderRows()}</TableBody>
        </Table>
        {this.renderAddButton()}
      </React.Fragment>
    )
  }

  renderContent = () => {
    const { loading } = this.state

    if (loading) {
      return <Loading isLoading={loading} />
    }

    return this.renderTable()
  }

  render() {
    return (
      <NavigationLayout title="Users">
        <h1>List</h1>
        <div>{this.renderContent()}</div>
      </NavigationLayout>
    )
  }
}
Users.contextType = LayoutContext

export default withMessage(withUserContext(withStyles(styles)(Users)))
