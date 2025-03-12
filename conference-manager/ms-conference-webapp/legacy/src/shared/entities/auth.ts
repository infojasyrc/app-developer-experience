export interface VerifyApiResponse {
  isAuth: boolean
  userUid: string
  email: string
  isAdmin?: boolean
  userName?: string | null
}
