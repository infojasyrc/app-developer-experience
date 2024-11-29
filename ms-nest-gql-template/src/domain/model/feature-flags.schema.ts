import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Application feature flags' })
export class FeatureFlags {
  @Field()
  applicationEnabled: boolean;
}
