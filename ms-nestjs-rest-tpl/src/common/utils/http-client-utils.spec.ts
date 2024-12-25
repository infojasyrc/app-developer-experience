import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { EnvironmentVariables } from 'src/infrastructure/environment-variables';
import { getAPIRequestHeaders } from './http-client-utils';
import { AxiosRequestHeaders } from 'axios';

describe('http-client-utils', () => {
  beforeEach(async () => {
    await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [ConfigService],
    }).compile();
  });

  it('should return an correct objects of headers', () => {
    const config = new ConfigService<EnvironmentVariables>();
    const headers: AxiosRequestHeaders = getAPIRequestHeaders(config);

    expect(headers).not.toBeNull();
    expect(headers).not.toBeUndefined();
    expect(headers.Authorization).toBe(
      `Bearer ${config.get('INTEGRATION_API_TOKEN')}`,
    );
  });
});
