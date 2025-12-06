// infrastructure/unleash.provider.ts
import { Provider } from '@nestjs/common';
import { initialize, Unleash } from 'unleash-client';

const UNLEASH_TOGGLE_AUTH = process.env.UNLEASH_TOGGLE_AUTH || 'auth.firebase.enabled';

const unleash: Unleash = initialize({
  url: process.env.UNLEASH_URL || 'http://localhost:4242/api',
  appName: process.env.UNLEASH_APP_NAME || 'ms-conference-api',
  customHeaders: {
    Authorization: process.env.UNLEASH_API_KEY || '',
  },
});

export const UnleashProvider: Provider = {
  provide: 'UNLEASH_CLIENT',
  useValue: unleash,
};

export const isAuthEnabled = (): boolean => {
  try {
    return unleash.isEnabled(UNLEASH_TOGGLE_AUTH);
  } catch {
    return false;
  }
};
