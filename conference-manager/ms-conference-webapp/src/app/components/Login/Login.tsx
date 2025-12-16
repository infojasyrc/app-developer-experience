"use client";
import React, { useState } from 'react';
import {
  MdMailOutline,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import GoogleButton from 'react-google-button';
import { loginStyle, customButton } from '../../shared/styles/login';
import Image from 'next/image';

export interface LoginProps {
  onLogin: (userName: string, password: string) => void;
  loading: boolean;
  googleOnLogin: () => void;
  errorMessage: boolean;
}

export default function Login({
  onLogin,
  googleOnLogin,
  errorMessage,
}: LoginProps): JSX.Element {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [disableLogin, setDisableLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleUserChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setUserName(text);
    verifyCredentials();
  };

  const handlePasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    verifyCredentials();
  };

  const verifyCredentials = () => {
    if (userName && userName !== '' && password && password !== '') {
      setDisableLogin(false);
    }
  };

  const isValidLoginData = () => {
    return !disableLogin && userName.includes('@') && password.length > 3;
  };

  const handleLoginClicked = () => {
    onLogin(userName, password);
  };

  return (
    <div className={loginStyle.loginBoxContainer}>
      <div className={loginStyle.logoContainer}>
        <Image src="/app-logo.svg" alt="App logo" width={180} height={52} />
      </div>
      <div className={loginStyle.input}>
        <div className={loginStyle.formContainer}>
          <div className="relative w-full mb-3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MdMailOutline className={loginStyle.icons} />
            </div>
            <input
              type="email"
              id="userName"
              name="userName"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="abc@email.com"
              value={userName}
              onChange={handleUserChanged}
            />
          </div>

          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MdLock className={loginStyle.icons} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="password"
              value={password}
              onChange={handlePasswordChanged}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {showPassword ? (
                <MdVisibility
                  onClick={() => setShowPassword(!showPassword)}
                  className={loginStyle.icons}
                />
              ) : (
                <MdVisibilityOff
                  onClick={() => setShowPassword(!showPassword)}
                  className={loginStyle.icons}
                />
              )}
            </div>
          </div>
          {errorMessage && <p className="text-red-500 text-xs italic">Incorrect password</p>}


          <button
            type="submit"
            className={loginStyle.button}
            disabled={!isValidLoginData()}
            onClick={handleLoginClicked}
            data-testid={'login-button'}
          >
            Login
          </button>
          <div className={loginStyle.googleButtonContainer}>
            <GoogleButton onClick={googleOnLogin} style={{...customButton}} label="Sign in with Google" />
          </div>
        </div>
      </div>
    </div>
  );
}
