import { Injectable } from '@nestjs/common';

import { FeatureFlagsPort } from '../../../../application/port/output/feature-flags.port.js';
import { FeatureFlags } from '../../../../domain/model/feature-flags.schema.js';
import { UnleashService } from '../../../../infrastructure/unleash/unleash.service.js';

@Injectable()
export class FeatureFlagsUnleashAdapter extends FeatureFlagsPort {
  constructor(private readonly unleash: UnleashService) {
    super();
  }

  async findAll(): Promise<FeatureFlags> {
    return {
      // TODO: Validate enable application
      applicationEnabled: true,
    };
  }
}
