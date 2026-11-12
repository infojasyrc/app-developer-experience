interface IEnvironment {
  ENVIRON: string;
}

const getEnvironmentVariables = (): IEnvironment => {
  const ENVIRON = process.env.NODE_ENV || "development";

  return {
    ENVIRON,
  };
};

const isDevelopment = (): boolean => {
  const { ENVIRON } = getEnvironmentVariables();
  return ENVIRON === "development";
};

export { getEnvironmentVariables, isDevelopment };
