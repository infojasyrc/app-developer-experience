import { FeatureFlags } from '../../../domain/model/feature-flags.schema';

export abstract class FeatureFlagsPort {
  abstract findAll(): Promise<FeatureFlags>;
}
