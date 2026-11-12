import React, { useState } from 'react'
import { Paper, TextField, Button, InputAdornment } from '@material-ui/core'
import Container from '@mui/material/Container'
import MailOutlineIcon from '@material-ui/icons/MailOutline'
import LockIcon from '@material-ui/icons/Lock'
import VisibilityIcon from '@material-ui/icons/Visibility'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'
import GoogleButton from 'react-google-button'
import { validateEmail } from '../../shared/tools'
import { loginStyle, customButton } from '../../shared/styles/login'
import logo from '../../assets/chupito-logo.svg'
import { useTranslation } from 'react-i18next'

export interface LoginProps {
  onLogin: (userName: string, password: string) => void
  loading: boolean
  googleOnLogin: (userName: string) => void
  errorMessage: boolean
}

export default function Login({
  onLogin,
  googleOnLogin,
  errorMessage,
}: LoginProps): JSX.Element {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [disableLogin, setDisableLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useTranslation("global");

  const hasText = !!userName
  const classes = loginStyle()
  const formBox = `${classes.input} ${hasText ? 'hasText' : ''}`;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  const handleUserChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setUserName(text)

    verifyCredentials()
  }

  const handlePasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    verifyCredentials()
  }

  const verifyCredentials = () => {
    if (userName && userName !== '' && password && password !== '') {
      setDisableLogin(false)
    }
  }

  const isValidLoginData = () => {
    return !disableLogin && validateEmail(userName) && password.length > 3
  }

  const handleLoginClicked = () => {
    onLogin(userName, password)
  }
  const handleGoogleLoginClicked = () => {
    googleOnLogin(userName)
  }

  return (
    <Container className={classes.loginBoxContainer}>
      <div className={classes.logoContainer}>
        <img src={logo} alt="Chupito logo" />
      </div>
      <div className={formBox}>
        <Paper elevation={3} className={classes.formContainer}>
          <TextField
            className={classes.input}
            id="userName"
            name="userName"
            label={t("login.lbl_user")}
            placeholder="abc@email.com"
            value={userName}
            variant="outlined"
            margin="normal"
            fullWidth
            onChange={handleUserChanged}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon className={classes.icons} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            error={errorMessage}
            className={classes.input}
            label={t("login.lbl_pass")}
            placeholder={t("login.lbl_pass")}
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            variant="outlined"
            fullWidth
            onChange={handlePasswordChanged}
            helperText={errorMessage && "Incorrect password"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon className={classes.icons} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {showPassword ? (
                    <VisibilityIcon
                      onClick={togglePasswordVisibility}
                      className={classes.icons}
                    />
                  ) : (
                    <VisibilityOffIcon
                      onClick={togglePasswordVisibility}
                      className={classes.icons}
                    />
                  )}
                </InputAdornment>
              ),
            }}
          />
          <Button
            className={classes.button}
            type="submit"
            variant="contained"
            fullWidth
            disabled={!isValidLoginData()}
            onClick={handleLoginClicked}
            data-testid={'login-button'}
          >
            {t("login.btn_title")}
          </Button>
          <div className={classes.googleButtonContainer}>
            <GoogleButton onClick={handleGoogleLoginClicked} type="light" style={customButton} label={t("login.btn_google")} />
          </div>
        </Paper>
      </div>
    </Container>
  )
}
