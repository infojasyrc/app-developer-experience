export const styles = theme => ({
  sectionFormButtons: {
    position: 'absolute',
    bottom: '2.5em',
    right: '5em'
  },
  primaryButton: {
    marginLeft: '2em',
    width: '12em',
    height: '2.85em',
    fontFamily: 'Exo',
    fontWeight: 'bold',
    fontSize: '1em',
    backgroundColor: theme.colors.orange,
    borderWidth: '0.15em',
    borderColor: theme.colors.orange,
    color: theme.colors.white
  },
  primaryButtonDisabled: {
    backgroundColor: theme.colors.orangeTransparent + ' !important',
    color: theme.colors.white + ' !important'

  },
  secondaryButton: {
    width: '12em',
    height: '2.85em',
    fontFamily: 'Exo',
    fontWeight: 'bold',
    fontSize: '1em',
    borderWidth: '0.15em',
    borderColor: theme.colors.orange,
    color: theme.colors.orange
  }
});
