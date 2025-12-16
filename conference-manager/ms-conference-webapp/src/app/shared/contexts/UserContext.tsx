"use client";
import React, { ReactNode, useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { UserCredentials, UserInApp, UserSession } from '../entities';

interface ContextProps {
  isLoggedIn: boolean;
  defaultLocation: null | string;
  user: null | UserSession;
  login: (
    user: UserInApp,
    userCredentials: UserCredentials,
    token: string
  ) => void;
  setLocation: (location: string) => void;
  logout: () => void;
}

const UserContext = React.createContext<Partial<ContextProps>>({});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<UserSession | null>('userData', null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);
  const [defaultLocation, setDefaultLocation] = useState<string | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const login = (
    userData: UserInApp,
    userCredentials: UserCredentials,
    token: string
  ) => {
    const userSession: UserSession = {
      ...userData,
      ...userCredentials,
      token,
    };
    setUser(userSession);
  };

  const setLocation = (location: string) => {
    setDefaultLocation(location);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        user,
        defaultLocation,
        login,
        setLocation,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

