export interface User {
  uid: string
  firstName: string
  lastName: string
  isAdmin: boolean
  email: string
  role?: UserRole
  isSuperAdmin?: boolean
}

export interface UserInApp extends User {
  id: string
}

export interface UserCredentials {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  phoneNumber?: string
}

export interface UserSession extends UserInApp, UserCredentials {
  token: string
}

export interface UserRole {
  _id: string
  name: string
}
