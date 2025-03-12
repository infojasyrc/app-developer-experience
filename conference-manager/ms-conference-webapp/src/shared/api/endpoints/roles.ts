import { requests } from '../baseRequest'
import { UserRole } from '../../entities'

enum RolesAPIEndpoints {
  getAll = 'roles',
}

function RolesAPI() {
  const getAll = async (): Promise<UserRole[]> => {
    const { data: allData } = await requests.get(RolesAPIEndpoints.getAll)
    const { data: rolesData } = allData
    const roles: UserRole[] = rolesData.map((role: UserRole) => role)
    return roles
  }

  return {
    getAll,
  }
}

export default RolesAPI
