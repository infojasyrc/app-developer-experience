const mockUnleashClient = {
  isEnabled: jest.fn(),
  getVariant: jest.fn(),
};

const mockUnleashClientModule = {
  startUnleash: jest.fn(() => mockUnleashClient),
  destroy: jest.fn(),
};

jest.mock('unleash-client', () => mockUnleashClientModule);

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UnleashService } from './unleash.service';

describe('UnleashService', () => {
  let unleashService: UnleashService;
  let mockConfigService: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn(),
    };
    mockUnleashClient.isEnabled.mockReset();
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UnleashService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    unleashService = app.get<UnleashService>(UnleashService);
  });

  test('should be defined', async () => {
    expect(unleashService).toBeDefined();
    await unleashService.onModuleInit();
    expect(mockUnleashClientModule.startUnleash).toHaveBeenCalled();
    expect(mockConfigService.get).toHaveBeenCalledTimes(2);
  });

  test('should check if given flag is enabled', async () => {
    await unleashService.onModuleInit();

    mockUnleashClient.isEnabled.mockReturnValue(false);

    const result = unleashService.isEnabled('ms-toggle-test-flag');

    expect(mockUnleashClientModule.startUnleash).toHaveBeenCalled();
    expect(mockUnleashClient.isEnabled).toHaveBeenCalledWith(
      'ms-toggle-test-flag',
      {
        userId: undefined,
      },
    );
    expect(result).toBeFalsy();
  });

  test('should check if given flag is enabled for the given user', async () => {
    await unleashService.onModuleInit();

    mockUnleashClient.isEnabled.mockReturnValue(false);

    const result = unleashService.isEnabled('ms-toggle-test-flag');

    expect(mockUnleashClientModule.startUnleash).toHaveBeenCalled();
    expect(mockUnleashClient.isEnabled).toHaveBeenCalledWith(
      'ms-toggle-test-flag',
      {},
    );
    expect(result).toBeFalsy();
  });

  test('should get a variant value for an anonymous user', async () => {
    await unleashService.onModuleInit();
    mockUnleashClient.getVariant.mockReturnValue({
      payload: {
        value: 'red',
      },
    });

    const result = unleashService.getVariant('ms-variant-test');

    expect(mockUnleashClientModule.startUnleash).toHaveBeenCalled();
    expect(mockUnleashClient.getVariant).toHaveBeenCalledWith(
      'ms-variant-test',
      {
        userId: undefined,
      },
    );
    expect(result).toEqual('red');
  });

  test('should get a variant value for the given user', async () => {
    await unleashService.onModuleInit();
    mockUnleashClient.getVariant.mockReturnValue({
      payload: {
        value: 'red',
      },
    });

    const result = unleashService.getVariant('ms-variant-test');

    expect(mockUnleashClientModule.startUnleash).toHaveBeenCalled();
    expect(mockUnleashClient.getVariant).toHaveBeenCalledWith(
      'ms-variant-test',
      {},
    );
    expect(result).toEqual('red');
  });

  test('should return undefined when a variant is not defined', async () => {
    await unleashService.onModuleInit();
    mockUnleashClient.getVariant.mockReturnValue({});

    const result = unleashService.getVariant('ms-variant-test');

    expect(mockUnleashClientModule.startUnleash).toHaveBeenCalled();
    expect(mockUnleashClient.getVariant).toHaveBeenCalledWith(
      'ms-variant-test',
      {},
    );
    expect(result).toBeUndefined();
  });

  test('should call destroy function calling onDestroy', () => {
    unleashService.onModuleDestroy();
    expect(mockUnleashClientModule.destroy).toHaveBeenCalled();
  });
});
