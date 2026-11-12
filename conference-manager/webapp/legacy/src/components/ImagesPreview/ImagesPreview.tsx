import { Grid, IconButton, createStyles, makeStyles } from '@material-ui/core'
import ImageIcon from '@material-ui/icons/AddAPhoto'

import RenderImage from './RenderImage'

import { ImageMediaType } from '../../shared/entities'

const useStyles = makeStyles(() =>
  createStyles({
    addImageIcon: {
      width: '2em',
      height: '1.25em',
    },
    addImageButton: {
      marginTop: '15%',
      marginLeft: '30%',
      width: '2.5em',
      height: '2.5em',
    },
    addImageButtonContainer: {
      marginTop: '1em',
      marginRight: '1em',
    },
    imagesContainer: {
      marginTop: '3em',
    },
  })
)

export interface ImagesPreviewProps {
  images: ImageMediaType[]
  selectedImages: []
  enableEdit: boolean
  onChange: () => void
  onDelete: (id: string, mediaType: string) => void
}

export default function ImagesPreview({
  images,
  selectedImages,
  enableEdit,
  onChange,
  onDelete,
}: ImagesPreviewProps): JSX.Element {
  const classes = useStyles()

  const handleDelete = (id: string, type: string) => {
    onDelete(id, type)
  }

  return (
    <Grid container className={classes.imagesContainer}>
      {enableEdit && (
        <Grid item xs={6} sm={4} md={2}>
          <div key="add" className={classes.addImageButtonContainer}>
            <IconButton
              data-testid="add-media-button"
              className={classes.addImageButton}
              color="secondary"
              component="label"
            >
              <ImageIcon className={classes.addImageIcon} />
              <input
                type="file"
                style={{
                  display: 'none',
                }}
                onChange={onChange}
              />
            </IconButton>
          </div>
        </Grid>
      )}
      {images.length > 0 &&
        images.map((image, index) => {
          return (
            <RenderImage
              key={index}
              contentId={image.id}
              contentType="image"
              contentSrc={image.url}
              allowEdit={enableEdit}
              onDelete={handleDelete}
            />
          )
        })}
      {selectedImages.length > 0 &&
        selectedImages.map((image, index) => {
          return (
            <RenderImage
              key={index}
              contentId={index.toString()}
              contentType="file"
              contentSrc={image}
              allowEdit={enableEdit}
              onDelete={handleDelete}
            />
          )
        })}
    </Grid>
  )
}
