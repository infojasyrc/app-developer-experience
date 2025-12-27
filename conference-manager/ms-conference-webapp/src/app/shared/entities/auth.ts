export interface AuthSession {
  isAuth: boolean;
  userUid?: string;
  displayName?: string | null;
}

export interface GoogleApiResponse {
  isAuth: boolean
  userUid: string
  email: string
  isAdmin?: boolean
  userName?: string | null
  displayName?: string | null
}
