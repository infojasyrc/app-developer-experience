import { colors } from '../../styles/theme/colors'

export const modalStyle ={
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: colors.white,
  boxShadow: 24,
  p: 4,
  borderRadius: '10px',

  "@media (max-width: 480px)" : {
    width: '70%',
  }
}

export const title = {
  margin: '10px 0px 30px',
  color: colors.dark,
  fontSize: '1.5em',
  boxShadow: `0px 1px 0px ${colors.gray}`,
}
