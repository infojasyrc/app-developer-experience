import { Injectable } from '@nestjs/common';

import { FeatureFlagsPort } from '../../../../application/port/output/feature-flags.port';
import { FeatureFlags } from '../../../../domain/model/feature-flags.schema';
import { UnleashService } from '../../../../infrastructure/unleash/unleash.service';

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
