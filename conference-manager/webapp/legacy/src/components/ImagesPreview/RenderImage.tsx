import {
  createStyles,
  makeStyles,
  Grid,
  Card,
  CardActions,
  CardMedia,
  IconButton,
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/DeleteOutlined'

import { MediaTypes } from '../../shared/entities'
import { colors } from '../../styles/theme/colors'

const useStyles = makeStyles(() =>
  createStyles({
    image: {
      borderRadius: '0.1em',
      marginTop: '1em',
      marginRight: '1em',
      position: 'relative',
    },
    imageDelete: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: colors.transparentBlack,
      color: colors.white,
    },
  })
)

export interface RenderImageProps {
  contentId: string
  contentType: MediaTypes
  contentSrc: string
  allowEdit: boolean
  onDelete: (id: string, contentType: string) => void
}

export default function RenderImage({
  contentId,
  contentType,
  contentSrc,
  allowEdit,
  onDelete,
}: RenderImageProps): JSX.Element {
  const classes = useStyles()

  return (
    <Grid
      item
      key={contentType === 'image' ? contentId : `file${contentId}`}
      xs={6}
      sm={4}
      md={2}
    >
      <Card className={classes.image}>
        <CardMedia component="img" image={contentSrc} />
        {allowEdit && (
          <CardActions>
            <IconButton
              data-testid="del-media-button"
              className={classes.imageDelete}
              onClick={() => {
                onDelete(contentId, contentType)
              }}
            >
              <DeleteIcon />
            </IconButton>
          </CardActions>
        )}
      </Card>
    </Grid>
  )
}
