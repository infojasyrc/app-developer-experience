import { Skeleton, Stack, Grid } from '@mui/material';
import { eventInfoStyles } from '../../pages/EventInfo/EventInfoStyle';
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const SkeletonEventDetails = () => {
    const classes = eventInfoStyles();
    const matchesDesktopDisplay = useMediaQuery(useTheme().breakpoints.up('sm'))

    return (
        <Grid spacing={1} className={classes.skeletonBody}>
            <Grid container justifyContent="space-between" direction="row" alignItems="center">
                <Skeleton width="20%" height={40} />
                <Skeleton width="15%" height={90} />
            </Grid>
            <Grid container justifyContent="space-between" direction="row" alignItems="center">
                <Skeleton width="30%" height={40} />
                <Skeleton width="25%" height={55} />
            </Grid>
            <Skeleton variant="rectangular" height={90} className={classes.space} />
            <Skeleton width="12%" height={40} className={classes.space} />
            <Stack spacing={2} direction="row" >
                <Skeleton width="10%" height={40} />
                <Skeleton width="10%" height={40} />
                <Skeleton width="10%" height={40} />
                <Skeleton width="10%" height={40} />
            </Stack>
            {matchesDesktopDisplay?
                <Stack spacing={2} direction="row" justifyContent="space-between" >
                    <Skeleton variant="rectangular" height={130} width="30%" />
                    <Skeleton variant="rectangular" height={130} width="30%" />
                    <Skeleton variant="rectangular" height={130} width="30%" />
                </Stack> :
                <Skeleton variant="rectangular" height={130} />
            }
        </Grid>
    );
}

export default SkeletonEventDetails;