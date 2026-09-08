import { ConfigService } from "@nestjs/config";
import { AxiosRequestHeaders } from "axios";
import { EnvironmentVariables } from "./../../infrastructure/environment-variables";

export const getAPIRequestHeaders = (
  config: ConfigService<EnvironmentVariables>,
): AxiosRequestHeaders =>
  ({
    Authorization: `Bearer ${config.get("INTEGRATION_API_TOKEN")}`,
  }) as AxiosRequestHeaders;
