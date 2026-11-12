export const baseStyles = (theme) => {
  return {
    barTitle: {
      marginLeft: '0',
      fontFamily: 'Exo',
      color: theme.colors.white,
      [
        theme
          .breakpoints
          .down("xs")
      ]: {
        display: 'none'
      }
    },
    primaryButton: {
      position: 'fixed',
      bottom: theme.spacing(2),
      right: theme.spacing(2.75)
    },
    secondaryButton: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(11.75)
    },
    textField: {
      display: 'flex',
      marginTop: theme.spacing,
      marginRight: theme.spacing(2)
    },
    wideInput: {}
  };
}
