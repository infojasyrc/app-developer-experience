import { FeatureFlags } from '../../../domain/model/feature-flags.schema.js';

export abstract class FeatureFlagsPort {
  abstract findAll(): Promise<FeatureFlags>;
}
