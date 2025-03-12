import { useEffect, useState } from 'react'
import { Fab, createStyles, makeStyles } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'

import UserList from '../../components/UserList/UserList'
import NavigationWrapper from '../../components/Navigation/NavigationWrapper'

import { UsersAPI } from '../../shared/api'
import { User } from '../../shared/entities'

const useStyles = makeStyles((theme) =>
  createStyles({
    add: {
      position: 'fixed',
      bottom: theme.spacing(2),
      right: theme.spacing(2.75),
    },
  })
)

export default function UsersPage(): JSX.Element {
  const [loading, setLoading] = useState(true)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const classes = useStyles()

  const apiUsers = UsersAPI()

  useEffect(() => {
    fetchData()
    /* eslint-disable */
  }, [])

  const fetchData = () => {
    setLoading(true)

    apiUsers
      .getAll()
      .then((users) => {
        setAllUsers(users)
      })
      .catch((error) => {
        console.log('Error retrieving all users')
        console.log(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  if (loading) {
    return <>Loading users...</>
  }

  return (
    <>
      {!loading && <UserList users={allUsers} />}
      <NavigationWrapper path="/user/add">
        <Fab className={classes.add} color="primary">
          <AddIcon />
        </Fab>
      </NavigationWrapper>
    </>
  )
}
