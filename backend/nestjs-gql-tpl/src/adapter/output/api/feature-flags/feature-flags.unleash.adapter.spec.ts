import { beforeEach, describe, expect, type Mock, test, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';

import { UnleashService } from '../../../../infrastructure/unleash/unleash.service.js';
import { FeatureFlagsUnleashAdapter } from './feature-flags.unleash.adapter.js';

describe('FeatureFlagsUnleashAdapter', () => {
  let adapter: FeatureFlagsUnleashAdapter;
  let mockUnleashService: {
    isEnabled: Mock;
    getVariant: Mock;
  };

  beforeEach(async () => {
    mockUnleashService = {
      isEnabled: vi.fn(),
      getVariant: vi.fn(),
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
