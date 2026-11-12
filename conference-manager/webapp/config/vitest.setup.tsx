// vitest.setup.tsx
import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Next.js App Router (next/navigation)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
  headers: vi.fn(() => new Headers()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    getAll: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock next/image for testing
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority, ...rest } = props;
    return <img {...rest} />;
  },
}));

// Mock next/link to prevent client-side errors
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

// Add other global mocks as needed for your specific app
