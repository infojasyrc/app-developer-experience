import { AuditFields } from '../../../common/interfaces/audit-fields.interface'

export interface HeadquarterResponse extends AuditFields {
  _id: string
  city: string
  country: string
}
