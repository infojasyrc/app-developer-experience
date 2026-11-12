import { AuthSession } from '../entities/auth';

export function Authentication() {
  return {
    async verifyAuth(): Promise<AuthSession> {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        const data = await res.json();
        const user = data?.user;
        return {
          isAuth: !!user,
          userUid: user?.uid || user?.userUid,
          displayName: user?.displayName,
        };
      } catch {
        return { isAuth: false, userUid: '', displayName: null };
      }
    },
    async login(payload: { email: string; password: string }) {
      // Placeholder login that sets server cookie via route handler
      await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { displayName: payload.email },
          credentials: { email: payload.email, password: payload.password },
          token: 'placeholder-token',
        }),
      });
      return { ok: true } as const;
    },
    async logout() {
      await fetch('/api/login', { method: 'DELETE' });
      return { ok: true } as const;
    },
  };
}
