import React from 'react'
import { UserContext } from '../contexts/UserContext'

export const withUserContext = (Component) => {
  return (props) => {
    return (
      <UserContext.Consumer>
        {(context) => <Component userContext={context} {...props} />}
      </UserContext.Consumer>
    )
  }
}
