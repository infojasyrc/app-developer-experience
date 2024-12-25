import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './../../infrastructure/environment-variables';
import { AxiosRequestHeaders } from 'axios';

export const getAPIRequestHeaders = (
  config: ConfigService<EnvironmentVariables>,
): AxiosRequestHeaders => (
  config.get('INTEGRATION_API_TOKEN')
);
