export const styles = (theme) => ({
  container: {
    position: 'absolute',
    top: '30%',
    left: '35%',
    width: '30%',
    minHeight: '35%',
    maxHeight: '35%',
    [theme.breakpoints.down('sm')]: {
      top: 0,
      left: 0,
      width: '100%',
    },
    [theme.breakpoints.only('md')]: {
      top: '25%',
      left: '25%',
      width: '50%',
      minHeight: '45%',
    },
    [theme.breakpoints.between('1280px', '1439px')]: {
      top: '25%',
      left: '25%',
      width: '50%',
      minHeight: '30%',
      maxHeight: '60%',
    },
    [theme.breakpoints.only('1440px')]: {
      top: '25%',
      left: '25%',
      width: '50%',
      minHeight: '50%',
      maxHeight: '80%',
    },
    [theme.breakpoints.up('lg')]: {
      top: '30%',
      left: '30%',
      width: '40%',
      minHeight: '50%',
      maxHeight: '80%',
    },
  },
  form: {
    minHeight: '100%',
    justifyContent: 'center',
    paddingBottom: '2em',
    textAlign: 'center',
  },
  title: {
    marginBottom: '4em',
  },
  input: {
    marginLeft: '2em',
    marginRight: '2em',
    marginBottom: '2em',
    [theme.breakpoints.up('sm')]: {
      marginLeft: '8em',
      marginRight: '8em',
    },
    [theme.breakpoints.up('md')]: {
      marginLeft: '2em',
      marginRight: '2em',
    },
  },
  button: {
    margin: theme.spacing,
  },
  loginLogo: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    width: '100%',
    height: '4em',
    backgroundColor: theme.colors.transparentBlack,
    backgroundSize: '12em auto',
    padding: '1em 0',
    marginBottom: '1.5em',
  },
})
