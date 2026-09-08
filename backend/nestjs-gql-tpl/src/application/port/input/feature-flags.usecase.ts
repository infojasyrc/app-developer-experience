import { FeatureFlags } from '../../../domain/model/feature-flags.schema';

export abstract class FeatureFlagsUseCase {
  abstract findAll(): Promise<FeatureFlags>;
}
