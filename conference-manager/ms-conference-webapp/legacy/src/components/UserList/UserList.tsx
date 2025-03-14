import {
  Checkbox,
  createStyles,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core'
import { User } from '../../shared/entities'

const useStyles = makeStyles(() =>
  createStyles({
    isAdmin: {
      cursor: 'default',
    },
  })
)

export interface UserListProps {
  users: User[]
}

export default function UserList({ users }: UserListProps): JSX.Element {
  const classes = useStyles()

  return (
    <>
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
        <TableBody>
          {users.map((user) => {
            return (
              <TableRow key={user.uid}>
                <TableCell></TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.role?.name}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={user.isAdmin}
                    className={classes.isAdmin}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </>
  )
}
