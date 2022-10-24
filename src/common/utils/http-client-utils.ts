import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/infrastructure/environment-variables';
import { AxiosRequestHeaders } from 'axios';

export const getAPIRequestHeaders = (
  config: ConfigService<EnvironmentVariables>,
): AxiosRequestHeaders => ({
  'X-Api-Version': '3',
  Authorization: `Bearer ${config.get('INTEGRATION_API_TOKEN')}`,
  Accept: 'application/json',
  'Content-Type': 'application/json',
});
