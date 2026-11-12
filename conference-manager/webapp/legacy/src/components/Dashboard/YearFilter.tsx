import CustomDropdown from '../CustomDropdown/CustomDropdown'

import { allYears } from '../../shared/constants/constants'
import { useTranslation } from 'react-i18next'

export type YearFilterProps = {
  onChange: (selectedYear: string) => void
}

export default function YearFilter({ onChange }: YearFilterProps): JSX.Element {
  const {t} = useTranslation("global")

  const handleYearChanged = (selectedOption: string) => {
    onChange(selectedOption)
  }

  return (
    <CustomDropdown
      htmlId="select-year"
      htmlName="select-year"
      elements={allYears}
      onChange={handleYearChanged}
      title={t('home.title_year')}
    />
  )
}
