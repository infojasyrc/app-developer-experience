"use client";
import React, { ReactNode, useState, useEffect } from 'react';
import { UserCredentials, UserInApp, UserSession } from '../../shared/entities';

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
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [defaultLocation, setDefaultLocation] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        const data = await res.json();
        setUser(data.user ?? null);
        setIsLoggedIn(!!data.user);
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      }
    };
    loadSession();
  }, []);

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
    // Persist on server via HttpOnly cookie
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userData, credentials: userCredentials, token }),
    })
      .then(() => {
        setUser(userSession);
        setIsLoggedIn(true);
      })
      .catch(() => {
        setUser(null);
        setIsLoggedIn(false);
      });
  };

  const setLocation = (location: string) => {
    setDefaultLocation(location);
  };

  const logout = () => {
    fetch('/api/login', { method: 'DELETE' }).finally(() => {
      setUser(null);
      setIsLoggedIn(false);
    });
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
