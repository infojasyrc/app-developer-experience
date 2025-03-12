import { useEffect, useState } from 'react'
import { Grid } from '@material-ui/core'

import YearFilter from './YearFilter'
import SortFilter from './SortFilter'

import { ConferenceFilters } from '../../shared/entities'
import { dashboardFiltersStyles } from '../../shared/styles/FilterEvents'

export type DashboardFiltersProps = {
  onChangeFilters: ({ year, sortBy }: ConferenceFilters) => void
}

export default function DashboardFilters({
  onChangeFilters,
}: DashboardFiltersProps): JSX.Element {
  const classes = dashboardFiltersStyles()
  const [filterSelectedYear, setFilterSelectedYear] = useState('')
  const [filterSelectedSort, setFilterSelectedSort] = useState('')

  const onChangeYear = (selectedYear: string) => {
    setFilterSelectedYear(selectedYear)
  }

  const onChangeSort = (selectedSort: string) => {
    setFilterSelectedSort(selectedSort)
  }

  useEffect(() => {
    onChangeFilters({ year: filterSelectedYear, sortBy: filterSelectedSort })
    // eslint-disable-next-line
  }, [filterSelectedYear, filterSelectedSort])

  return (
    <div data-testid="gridDashboardFilters" className={classes.contentFilters}>
      <Grid item xs={12} sm={4} className={classes.filterSelector}>
        <YearFilter onChange={onChangeYear} />
        <SortFilter onChange={onChangeSort} />
      </Grid>
    </div>
  )
}
