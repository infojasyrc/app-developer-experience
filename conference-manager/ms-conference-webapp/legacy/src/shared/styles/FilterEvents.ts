import { createStyles, makeStyles } from "@material-ui/core";

export const headquartersStyles = makeStyles((theme) =>
  createStyles({
    headquarterFilterLabel: {
      fontWeight: 'bold',
      marginRight: '1em',
    },
    headquarterSelect: {
      width: '15em',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
  })
)

export const dashboardFiltersStyles = makeStyles((theme) =>
  createStyles({
    filterSelector: {
      textAlign: 'right',
      marginTop: '0',
      maxWidth: '100px',
      [theme.breakpoints.up('sm')]: {
        marginTop: '-0.5em',
      },
      [theme.breakpoints.down('xs')]: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        maxWidth: '100%',
        marginTop: '20px',
      },
    },
    contentFilters: {
      [theme.breakpoints.down('xs')]: {
        width: '90%'
      }
    }
  })
)
