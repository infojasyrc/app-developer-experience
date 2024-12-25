import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { startUnleash, Unleash, destroy, Context } from 'unleash-client';
import { EnvironmentVariables } from '../environment-variables';

type ToggleFeatureName = `ms-toggle-${string}`;
type UserFeatureName = `ms-user-${string}`;

@Injectable()
export class UnleashService implements OnModuleInit, OnModuleDestroy {
  private unleash: Unleash;
  constructor(private readonly config: ConfigService<EnvironmentVariables>) {}

  async onModuleInit(): Promise<void> {
    this.unleash = await startUnleash({
      appName: 'ms-nestjs-template',
      url: this.config.get('UNLEASH_API_URL'),
      customHeaders: {
        Authorization: this.config.get('UNLEASH_API_TOKEN'),
      },
    });
  }

  isEnabled(name: ToggleFeatureName | UserFeatureName): boolean {
    const unleashContext: Context = {};
    return this.unleash.isEnabled(name, unleashContext);
  }

  getVariant(name: string): string | undefined {
    const unleashContext: Context = {};
    return this.unleash.getVariant(name, unleashContext).payload?.value;
  }

  onModuleDestroy() {
    destroy();
  }
}
