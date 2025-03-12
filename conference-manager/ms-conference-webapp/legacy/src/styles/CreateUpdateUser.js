import {baseStyles} from './Base';

export const styles = theme => ({
  textField: baseStyles(theme).textField,
  avatarButton: {
    marginTop: theme.spacing
  },
  avatar: {
    width: '80px',
    height: '80px'
  },
  wideInput: baseStyles(theme).wideInput,
  cancel: baseStyles(theme).secondaryButton,
  save: baseStyles(theme).primaryButton
});
