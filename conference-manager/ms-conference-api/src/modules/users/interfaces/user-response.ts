import { AuditFields } from '../../../common/interfaces/audit-fields.interface'

export interface UserResponse extends AuditFields {
  _id: string
  uid: string
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
  isSuperAdmin: boolean
}
