import React, { useState } from 'react';

import { AppBar, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core'
import { Person } from '@material-ui/icons'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { headerStyles } from '../../shared/styles/Headers'

import logo from '../../assets/chupito-logo.svg'
import { HeaderProps } from './types';
import { useTranslation } from "react-i18next";
import { languages } from '../../shared/constants/constants';

export default function Header({
  isAuthenticated,
  username,
  onLogin,
  onLogout,
  version = '',
}: HeaderProps): JSX.Element {
  const classes = headerStyles()
  const { t, i18n } = useTranslation("global");
  const [lng, setLng] = useState("en")

  const handleChange = (event: SelectChangeEvent) => {
    setLng(event.target.value as string)
    i18n.changeLanguage(event.target.value as string)
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar data-testid="header" >
      <Toolbar className={classes.toolbar}>
        <div className={classes.logoContainer}>
          <img src={logo} alt="logo" className={classes.sizeLogo} />
        </div>
        <div className={classes.logout}>
          <Select
            id="language-select"
            value={lng}
            label="Language"
            onChange={handleChange}
            className={classes.selectLng}
          >
            {languages.map((lng) => (
              <MenuItem key={lng.code} value={lng.code}>{lng.name}</MenuItem>
            ))}
          </Select>
          {isAuthenticated ? (
            <>
              <IconButton
                aria-label="account"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
              >
                <Person className={classes.colorIcon} />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <Typography className={classes.userEmail}>{username}</Typography>
                <MenuItem >{t('header.profile')}</MenuItem>
                <MenuItem onClick={onLogout}>{t('header.logout')}</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={onLogin}
              className={classes.buttonLogin}
            >
              {t('header.login')}
            </Button>
          )}
        </div>
        <label className={classes.version}>v{version}</label>
      </Toolbar>
    </AppBar>
  )
}

