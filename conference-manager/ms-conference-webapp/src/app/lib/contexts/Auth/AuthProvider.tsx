"use client";
import { useReducer, ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { Authentication } from '../../../shared/api'
import { reducer, State } from './AuthReducer'

import { AuthSession } from '../../../shared/entities/auth'

type Props = {
  children: ReactNode
}
let initialState: State = {
  isAuth: false,
}

export const AuthProvider = ({ children }: Props) => {

  const api = Authentication()

  const verifyUser = async () => {
    try {
      const payload : AuthSession = await api.verifyAuth()
      dispatch({
        type: 'UPDATE_USER',
        payload
      })

      if (payload.isAuth) {
        await getUserInfo(payload.userUid)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  const getUserInfo = async (userUid: string, displayName?: string) => {
    // TODO: get user info from db
    // eslint-disable-next-line no-console
    console.log('user id: ', userUid)
    // eslint-disable-next-line no-console
    console.log('display name: ', displayName)
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const setLoginData = (payload: State) => {
    dispatch({
      type: 'UPDATE_USER',
      payload
    })
  }

  return (
    <AuthContext.Provider
      value={{ ...state, setLoginData, verifyUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}
