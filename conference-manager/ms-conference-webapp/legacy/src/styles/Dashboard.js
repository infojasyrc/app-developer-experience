import {baseStyles} from './Base';

export const styles = theme => ({
  title: {
    margin: '0',
    marginBottom: '0.5em'
  },
  headquarterFilter: {
    marginBottom: '1em'
  },
  centeredContent: {
    justifyContent: 'center'
  },
  noResults: {
    marginRight: 'auto',
    marginLeft: 'auto',
    paddingTop: '3em'
  },
  add: baseStyles(theme).primaryButton
});
