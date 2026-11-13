import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, type Mock, test, vi } from 'vitest';
import { UnleashService } from './unleash.service.js';

// vi.mock is hoisted above the imports, so the mocks it uses must be hoisted too
const { mockUnleashClient, mockUnleashClientModule } = vi.hoisted(() => {
  const mockUnleashClient = {
    isEnabled: vi.fn(),
    getVariant: vi.fn(),
  };
  const mockUnleashClientModule = {
    startUnleash: vi.fn(() => mockUnleashClient),
    destroy: vi.fn(),
  };
  return { mockUnleashClient, mockUnleashClientModule };
});

vi.mock('unleash-client', () => mockUnleashClientModule);

describe('UnleashService', () => {
  let unleashService: UnleashService;
  let mockConfigService: {
    get: Mock;
  };

  beforeEach(async () => {
    mockConfigService = {
      get: vi.fn(),
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
