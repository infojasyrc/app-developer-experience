import CustomDropdown from '../CustomDropdown/CustomDropdown'
import { useTranslation } from 'react-i18next'
import { convertArr18n } from '../../shared/tools'
export type SortFilterProps = {
  onChange: (selectedSort: string) => void
}

export default function SortFilter({ onChange }: SortFilterProps): JSX.Element {
  const { t } = useTranslation("global")
  const handleSortByChanged = (sortBySelected: string) => {
    onChange(sortBySelected)
  }

  return (
    <CustomDropdown
      elements={convertArr18n(t,'home.arr_sorter')}
      title={t('home.title_dates')}
      onChange={handleSortByChanged}
      htmlId="sorter"
      htmlName="sorter"
    />
  )
}
