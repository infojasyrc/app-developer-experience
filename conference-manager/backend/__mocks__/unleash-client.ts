// __mocks__/unleash-client.ts
export type Unleash = {
  isEnabled: (toggleName: string, context?: any) => boolean;
  start: () => void;
  stop: () => void;
};

export const initialize = (_opts: any): Unleash => {
  return {
    isEnabled: () => true,
    start: () => {},
    stop: () => {},
  };
};
