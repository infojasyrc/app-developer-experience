import { ChangeEvent } from 'react'
import {
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  makeStyles,
  createStyles,
} from '@material-ui/core'

import LoadingWrapper from '../Loading/LoadingWrapper'

const useStyles = makeStyles((theme) =>
  createStyles({
    textField: {
      display: 'flex',
      marginTop: theme.spacing(1),
    },
    wideInput: {},
  })
)

interface ElementOption {
  _id: string
  name: string
}

export interface SelectWithLoadingProps {
  attributeName: string
  attributeLabel: string
  attributeValue: string
  attributeRequired: boolean
  attributeOptions: ElementOption[]
  error?: boolean
  errorMessage?: string
  onChange: (event:ChangeEvent<{ name?: string | undefined; value: unknown; }>) => void
  onBlur?: () => void
  isLoading: boolean
}

export default function SelectWithLoading({
  attributeName,
  attributeLabel,
  attributeValue,
  attributeRequired,
  attributeOptions,
  error,
  errorMessage,
  onChange,
  onBlur,
  isLoading,
}: SelectWithLoadingProps): JSX.Element {
  const classes = useStyles()

  if (isLoading) {
    return (
      <LoadingWrapper
        isLoading={isLoading}
        middlePosition={{
          top: '30px',
          left: '190px',
        }}
        data-testid="loader-wrapper"
      >
        <FormControl
          className={[classes.textField, classes.wideInput].join(' ')}
        >
          <InputLabel htmlFor={attributeName}>{attributeLabel}</InputLabel>
          <Select
            disabled
            value={''}
            inputProps={{
              name: attributeName,
              id: attributeName,
            }}
            data-testid="select-with-loader"
            onChange={onChange}
          ></Select>
        </FormControl>
      </LoadingWrapper>
    )
  }

  return (
    <FormControl className={[classes.textField, classes.wideInput].join(' ')}>
      <InputLabel
        error={error}
        required={attributeRequired}
        htmlFor={attributeName}
      >
        {attributeLabel}
      </InputLabel>
      <Select
        required={attributeRequired}
        value={attributeValue}
        inputProps={{
          name: attributeName,
          id: attributeName,
        }}
        data-testid="select-with-loader"
        onChange={onChange}
        onBlur={onBlur}
      >
        {attributeOptions &&
          attributeOptions.map((item) => {
            return (
              <MenuItem key={item.name} value={item._id}>
                {item.name}
              </MenuItem>
            )
          })}
      </Select>
      {error && (
        <FormHelperText error data-testid="helper-select-with-loadding-error">
          {errorMessage}
        </FormHelperText>
      )}
    </FormControl>
  )
}
