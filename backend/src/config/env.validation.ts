import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export const NODE_ENVIRONMENTS = ['development', 'production', 'test'] as const;

const EmptyAsUnset = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  );

export class EnvironmentVariables {
  @IsIn(NODE_ENVIRONMENTS)
  NODE_ENV: (typeof NODE_ENVIRONMENTS)[number] = 'development';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 5000;

  @Matches(/^mongodb(\+srv)?:\/\//, {
    message: 'MONGODB_URI must be a mongodb:// or mongodb+srv:// URL',
  })
  MONGODB_URI: string;

  @EmptyAsUnset()
  @IsOptional()
  @IsString()
  @MinLength(10)
  TOMTOM_API_KEY?: string;

  @IsUrl({ require_tld: false })
  NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

  @IsUrl({ require_tld: false })
  OSRM_URL = 'https://router.project-osrm.org';

  @EmptyAsUnset()
  @IsOptional()
  @IsEmail()
  CONTACT_EMAIL?: string;

  @IsIn(['true', 'false'])
  SWAGGER_ENABLED: 'true' | 'false' = 'true';

  @IsString()
  TRUST_PROXY = 'loopback';
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const env = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(env, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors.flatMap((error) => Object.values(error.constraints ?? {}));
    throw new Error(`Invalid environment variables:\n- ${details.join('\n- ')}`);
  }

  return env;
}
