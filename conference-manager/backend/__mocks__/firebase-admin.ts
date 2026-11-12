// __mocks__/firebase-admin.ts
const mockVerifyIdToken = jest.fn();

export const auth = () => ({
  verifyIdToken: mockVerifyIdToken,
});

export const credential = {
  applicationDefault: jest.fn(),
  cert: jest.fn().mockReturnValue({}),
};

export const initializeApp = jest.fn();

export default {
  auth,
  credential,
  initializeApp,
  __mockVerifyIdToken: mockVerifyIdToken,
};
