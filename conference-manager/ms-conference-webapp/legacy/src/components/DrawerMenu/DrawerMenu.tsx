import { useContext } from 'react'
import {
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import AccountCircleIcon from '@material-ui/icons/AccountCircleRounded'
import LogoutIcon from '@material-ui/icons/ExitToAppRounded'

import LeftMenu from '../LeftMenu/LeftMenu'

import UserContext from '../../shared/contexts/UserContext'

import { colors } from '../../styles/theme/colors'

const useStyles = makeStyles(() =>
  createStyles({
    drawerTop: {
      height: '10em',
      width: '15em',
      backgroundColor: colors.orange,
      paddingTop: '1em',
      paddingLeft: '1em',
    },
    drawerMiddle: {},
    drawerBottom: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
    userImage: {
      height: 100,
      width: 100,
    },
    userName: {
      color: colors.white,
      fontWeight: 'bold',
      fontSize: 'large',
    },
    role: {
      color: colors.white,
      fontSize: 'medium',
      fontStyle: 'oblique',
    },
  })
)

export interface DrawerMenuProps {
  open: boolean
  onClose: () => void
  onLogout: () => void
}

export default function DrawerMenu({
  open,
  onClose,
  onLogout,
}: DrawerMenuProps): JSX.Element {
  const classes = useStyles()
  const { user } = useContext(UserContext)

  return (
    <Drawer open={open} onClose={onClose}>
      <div className={classes.drawerTop}>
        {!user?.photoURL && (
          <AccountCircleIcon className={classes.userImage} />
        )}
        {user?.photoURL && (
          <Avatar
            className={classes.userImage}
            alt="user"
            src={user?.photoURL}
          />
        )}
        <div>
          <label className={classes.userName}>{user?.displayName}</label>
        </div>
        <div>
          <label className={classes.role}>{user?.role}</label>
        </div>
      </div>
      <div className={classes.drawerMiddle}>
        <LeftMenu isAdmin={user?.isAdmin || false} />
      </div>
      <div className={classes.drawerBottom}>
        <List>
          <ListItem button onClick={onLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </div>
    </Drawer>
  )
}
