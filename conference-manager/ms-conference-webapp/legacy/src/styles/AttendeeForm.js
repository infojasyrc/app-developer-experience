import {baseStyles} from './Base';

export const styles = theme => ({
  container: {
    position: 'relative',
    marginLeft: '6em',
    marginRight: '6em',
    paddingTop: '2em',
    paddingBottom: '2em',
    paddingLeft: '6em',
    paddingRight: '6em'
  },
  stepContainer: {
    marginBottom: '2em'
  },
  buttonsContainer: {
    alignContent: 'right',
    flexDirection: 'row-reverse',
    marginTop: '2em'
  },
  primaryButton: {
    borderWidth: '0.15em',
    borderColor: theme.colors.orange,
    width: '8em'
  },
  secondaryButton: {
    borderWidth: '0.15em',
    borderColor: theme.colors.lightOrange,
    marginRight: '1em',
    width: '8em'
  },
  textField: {
    ...baseStyles(theme).textField,
    marginRight: 0,
    marginBottom: '2.5em'
  },
  thanksTitle: {
    color: theme.colors.orange,
    fontFamily: 'Exo',
    textAlign: 'center',
    marginBottom: '0.25em'
  },
  thanksSubTitle: {
    color: theme.colors.dark,
    fontFamily: 'Exo',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: '2em'
  },
  thanksButton: {
    position: 'relative',
    left: '40%'
  }
});