import {baseStyles} from './Base';

export const styles = theme => ({
  add: baseStyles(theme).primaryButton,
  edit: {
    color: theme.colors.orange,
    marginRight: theme.spacing
  },
  disable: {
    color: theme.colors.red
  },
  enable: {
    color: theme.colors.green
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderStyle: 'solid',
    borderWidth: '4px',
    borderColor: theme.colors.orange,
    borderRadius: '50%'
  },
  isAdmin: {
    cursor: 'default'
  }
});
