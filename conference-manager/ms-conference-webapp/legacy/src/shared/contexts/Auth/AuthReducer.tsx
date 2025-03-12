export type UserState = {
  id: string
  email: string
  firstName: string
  lastName: string
  isAdmin: boolean | undefined
}

export type AuthState = {
  isAuth: boolean
  user?: UserState
  verifyUser?: any
}

export type State = AuthState

export type UpdateUserAction = {
  type: 'UPDATE_USER'
  payload: State
}

export type Action = UpdateUserAction

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'UPDATE_USER': {
      return { ...state, ...action.payload, }
    }
    default:
      return state
  }
}
