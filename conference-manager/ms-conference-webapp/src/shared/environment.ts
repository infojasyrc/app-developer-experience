interface IEnvironment {
  ENVIRON: string;
}

const getEnvironmentVariables = () => {
  const ENVIRON = process.env.NODE_ENV === "development" || "development";

  return {
    ENVIRON,
  };
};

export { getEnvironmentVariables };
