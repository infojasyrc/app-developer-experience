import { FeatureFlags } from '../../../domain/model/feature-flags.schema.js';

export abstract class FeatureFlagsUseCase {
  abstract findAll(): Promise<FeatureFlags>;
}
