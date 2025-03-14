import { requests } from '../baseRequest'

enum UsersAPIEndpoints {
  getAll = 'users',
}

function UsersAPI() {

  const getAll = async () => {
    const response = await requests.get(UsersAPIEndpoints.getAll)
    return response.data.data
  }

  const getVerifyUser = async (id: string) => {
    const { data } = await requests.get(`${UsersAPIEndpoints.getAll}/${id}`)
    return data.data
  }

  return {
    getAll,
    getVerifyUser,
  }
}

export default UsersAPI
