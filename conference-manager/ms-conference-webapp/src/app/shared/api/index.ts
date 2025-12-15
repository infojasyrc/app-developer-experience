export type VerifyApiResponse = {
  isAuth: boolean;
  userUid?: string;
  displayName?: string;
};

export function Authentication() {
  return {
    async verifyAuth(): Promise<VerifyApiResponse> {
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
        return { isAuth: false };
      }
    },
  };
}
