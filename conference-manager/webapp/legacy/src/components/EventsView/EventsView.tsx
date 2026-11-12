import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles, createStyles, Grid, Fab } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import FullLayout from '../../hocs/FullLayout'
import EventList from '../EventList/EventList'
import Headquarters from '../Headquarters/Headquarters'
import DashboardFilters from '../Dashboard/DashboardFilters'
import NavigationWrapper from '../Navigation/NavigationWrapper'

import {
  Conference,
  Headquarter,
  ConferenceFilters,
} from '../../shared/entities'

import { sortAscending, sortDescending } from '../../shared/tools/sorting'

const useStyles = makeStyles((theme) =>
  createStyles({
    container:{
      paddingTop: '45px',
      paddingLeft: '10px',
      paddingRight: '10px',
      [theme.breakpoints.up('sm')]: {
        padding: '45px',
      },
    },
    title: {
      marginTop: '1.5em',
      marginBottom: '0.5em',
    },
    headquarterFilter: {
      paddingBottom: '20px',
      marginBottom: '20px',
      boxShadow: '0px #cdcdcd',
      [theme.breakpoints.up('sm')]: {
        boxShadow: '0px 1px 0px #cdcdcd',
      },
    },
    centeredContent: {
      justifyContent: 'center',
    },
    noResults: {
      marginRight: 'auto',
      marginLeft: 'auto',
      paddingTop: '3em',
    },
  })
)

export interface EventsViewProps {
  events: Conference[]
  allHeadquarters: Headquarter[]
  loadingEvents: boolean
  loadingHeadquarters: boolean
  isAdmin: boolean
  selectedHeadquarter?: string
}

export default function EventsView({
  events,
  allHeadquarters,
  loadingEvents,
  loadingHeadquarters,
  isAdmin,
  selectedHeadquarter = '-1',
}: EventsViewProps): JSX.Element {
  const [allEvents] = useState<Conference[]>(events)
  const [filteredEvents, setFilteredEvents] = useState<Conference[]>(events)
  const {t} = useTranslation('global')
  const classes = useStyles()
  const theme = useTheme()
  const matchesDesktopDisplay = useMediaQuery(theme.breakpoints.up('sm'))

  const handleChangeFilters = (filters: ConferenceFilters) => {
    if (filters.sortBy) {
      const sortedAllEvents =
        filters.sortBy === 'newest'
          ? JSON.parse(JSON.stringify(allEvents)).sort(sortDescending)
          : JSON.parse(JSON.stringify(allEvents)).sort(sortAscending)
      setFilteredEvents(sortedAllEvents)
    }
  }

  const handleHeadquarterChanged = (selectedHeadquarter: string) => {
    let filteredByHeadquarter: Conference[] = JSON.parse(
      JSON.stringify(allEvents)
    )

    if (selectedHeadquarter !== '-1') {
      filteredByHeadquarter = filteredByHeadquarter.filter(
        (element: Conference) =>
          element.headquarter && element.headquarter._id === selectedHeadquarter
      )
    }

    setFilteredEvents(filteredByHeadquarter)
  }

  if (loadingEvents) {
    return <>{t('events.load')}</>
  }

  return (
    <>
      {!loadingEvents && (
        <FullLayout title="Conferences" >
          <div className={classes.container}>
            {matchesDesktopDisplay && <h1 className={classes.title}>{t('events.title')}</h1>}
            <Grid
              container
              justifyContent="space-evenly"
              className={classes.headquarterFilter}
            >
              {loadingEvents && <>{t('events.load_headquarter')}</>}
              {!loadingEvents && matchesDesktopDisplay ? (
                <Headquarters
                  onChangeHeadquarter={handleHeadquarterChanged}
                  allHeadquarters={allHeadquarters}
                  selectedHeadquarter={selectedHeadquarter}
                  loading={loadingHeadquarters}
                />
              ) : null}
              {matchesDesktopDisplay ? (
                <DashboardFilters onChangeFilters={handleChangeFilters} />
              ) : null}
            </Grid>
            <Grid container justifyContent="center">
              <EventList events={filteredEvents} />
            </Grid>
            {isAdmin && (
              <NavigationWrapper path="/event/add">
                <Fab color="primary">
                  <AddIcon />
                </Fab>
              </NavigationWrapper>
            )}
          </div>
        </FullLayout>
      )}
    </>
  )
}
