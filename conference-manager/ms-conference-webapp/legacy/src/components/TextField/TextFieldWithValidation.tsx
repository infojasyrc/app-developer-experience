import { TextField, TextFieldProps } from '@material-ui/core'

type PickedTextFieldProps =
  | 'id'
  | 'className'
  | 'value'
  | 'disabled'
  | 'type'
  | 'variant'
  | 'name'
  | 'error'
  | 'label'
  | 'required'
  | 'helperText'
  | 'onBlur'
  | 'onKeyUp'
  | 'onChange'
  | 'InputProps'
  | 'inputProps'
  | 'InputLabelProps'

type TextFieldPartial = Pick<TextFieldProps, PickedTextFieldProps>

export type TextFieldWithValidationProps = TextFieldPartial

export default function TextFieldWithValidation({
  id,
  className,
  name,
  label,
  variant = 'standard',
  helperText,
  disabled,
  error,
  value,
  required,
  type = 'text',
  onChange,
  onBlur,
  onKeyUp,
  InputProps,
  InputLabelProps,
  inputProps,
}: TextFieldWithValidationProps): JSX.Element {

  return (
    <TextField
      id={id}
      name={name}
      className={className}
      variant={variant}
      required={required}
      disabled={disabled}
      label={label}
      value={value}
      helperText={helperText}
      margin="dense"
      type={type}
      error={error}
      InputProps={InputProps}
      InputLabelProps={InputLabelProps}
      inputProps={inputProps}
      onChange={onChange}
      onKeyUp={onKeyUp}
      onBlur={onBlur}
    />
  )
}
