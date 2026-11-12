import {baseStyles} from './Base';

export const styles = theme => ({
  title: baseStyles(theme).barTitle,
  arrowBackIcon: {
    color: theme.colors.white
  },
  logo: {
    position: 'sticky',
    left: '46%',
    height: '2.5em'
  }
});