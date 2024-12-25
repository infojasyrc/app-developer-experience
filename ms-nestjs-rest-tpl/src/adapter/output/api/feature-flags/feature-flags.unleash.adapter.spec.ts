import { Test, TestingModule } from '@nestjs/testing';

import { UnleashService } from '../../../../infrastructure/unleash/unleash.service';
import { FeatureFlagsUnleashAdapter } from './feature-flags.unleash.adapter';

describe('FeatureFlagsUnleashAdapter', () => {
  let adapter: FeatureFlagsUnleashAdapter;
  let mockUnleashService: {
    isEnabled: jest.Mock;
    getVariant: jest.Mock;
  };

  beforeEach(async () => {
    mockUnleashService = {
      isEnabled: jest.fn(),
      getVariant: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagsUnleashAdapter,
        {
          provide: UnleashService,
          useValue: mockUnleashService,
        },
      ],
    }).compile();

    adapter = app.get<FeatureFlagsUnleashAdapter>(FeatureFlagsUnleashAdapter);
  });

  test('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  test('should return a valid feature flags set', async () => {
    mockUnleashService.isEnabled.mockReturnValueOnce(false);
    mockUnleashService.getVariant.mockReturnValueOnce('blue');

    const result = await adapter.findAll();
    expect(result).not.toBeNull();
    expect(result.applicationEnabled).toBeTruthy();
  });
});
