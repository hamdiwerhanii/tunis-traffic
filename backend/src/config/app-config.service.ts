import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './env.validation.js';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  get isProduction(): boolean {
    return this.config.get('NODE_ENV', { infer: true }) === 'production';
  }

  get isTest(): boolean {
    return this.config.get('NODE_ENV', { infer: true }) === 'test';
  }

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  get mongoUri(): string {
    return this.config.get('MONGODB_URI', { infer: true });
  }

  get tomtomApiKey(): string | undefined {
    return this.config.get('TOMTOM_API_KEY', { infer: true }) || undefined;
  }

  get nominatimUrl(): string {
    return this.config.get('NOMINATIM_URL', { infer: true }).replace(/\/$/, '');
  }

  get osrmUrl(): string {
    return this.config.get('OSRM_URL', { infer: true }).replace(/\/$/, '');
  }

  get userAgent(): string {
    const contact = this.config.get('CONTACT_EMAIL', { infer: true });
    return `TunisTraffic/2.0 (+https://github.com/hamdiwerhanii/tunis-traffic${contact ? `; ${contact}` : ''})`;
  }

  get swaggerEnabled(): boolean {
    return this.config.get('SWAGGER_ENABLED', { infer: true }) === 'true';
  }

  get trustProxy(): boolean | number | string {
    const value = this.config.get('TRUST_PROXY', { infer: true });
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^\d+$/.test(value)) return Number(value);
    return value;
  }
}
