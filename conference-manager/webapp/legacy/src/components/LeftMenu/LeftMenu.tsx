import { List } from '@material-ui/core'

import AccountCircleIcon from '@material-ui/icons/AccountCircleRounded'
import VpnKeyIcon from '@material-ui/icons/VpnKey'

import LeftMenuOption from '../LeftMenuOption/LeftMenuOption'

export interface LeftMenuProps {
  isAdmin: boolean
}

export default function LeftMenu({ isAdmin }: LeftMenuProps): JSX.Element {
  return (
    <List>
      <LeftMenuOption
        path="/user/change-password"
        title="Change Password"
        iconComponent={<VpnKeyIcon />}
      />
      <LeftMenuOption path="/events" title="Events" iconComponent="" />
      {isAdmin && (
        <LeftMenuOption
          path="/users"
          title="Users"
          iconComponent={<AccountCircleIcon />}
        />
      )}
    </List>
  )
}
