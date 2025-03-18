import { useEffect, useState } from 'react'

import UserForm from '../../components/UserForm/UserForm'

import { RolesAPI } from '../../shared/api'
import { UserRole } from '../../shared/entities'

export default function UserPage(): JSX.Element {
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)

  const apiRoles = RolesAPI()

  const fetchRoles = () => {
    setLoading(true)
    apiRoles
      .getAll()
      .then((roles) => {
        setAvailableRoles(roles)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log('Error retrieving all roles')
        // eslint-disable-next-line no-console
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchRoles()
    /* eslint-disable */
  }, [])

  if (loading) {
    return <>Loading information...</>
  }

  return <>{!loading && <UserForm availableRoles={availableRoles} />}</>
}
