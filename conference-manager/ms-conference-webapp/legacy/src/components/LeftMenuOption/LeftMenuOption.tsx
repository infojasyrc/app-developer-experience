import { ReactNode } from 'react'
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core'

import NavigationWrapper from '../Navigation/NavigationWrapper'

export type LeftMenuOptionProps = {
  path: string
  title: string
  iconComponent: ReactNode
}

export default function LeftMenuOption({
  path,
  title,
  iconComponent,
}: LeftMenuOptionProps): JSX.Element {
  return (
    <NavigationWrapper path={path}>
      <ListItem button>
        <ListItemIcon>{iconComponent}</ListItemIcon>
        <ListItemText primary={title} />
      </ListItem>
    </NavigationWrapper>
  )
}
