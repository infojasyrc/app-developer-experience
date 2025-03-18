import { ConferenceDataValidation } from '../conference'
import { Headquarter } from '../headquarter'
import { Tag } from '../tag'

export interface EventEditViewProps {
  headquarters: Headquarter[]
  tags: Tag[]
  validation: ConferenceDataValidation
  isLoading: boolean
}

export const InputLabelProps = {
  shrink: true,
}
