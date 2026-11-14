import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

export function loadConfiguration(
  environment: NodeJS.ProcessEnv = process.env,
  envFilePath = '.env',
) {
  const values = {
    ...(existsSync(envFilePath)
      ? parseEnv(readFileSync(envFilePath, 'utf8'))
      : {}),
    ...environment,
  };
  const required = (name: string): string => {
    const value = values[name];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Invalid configuration: ${name} is required`);
    }
    return value;
  };
  const port = (name: string): number => {
    const value = required(name);
    const parsed = Number(value);
    if (
      !/^\d+$/.test(value) ||
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      parsed > 65535
    ) {
      throw new Error(
        `Invalid configuration: ${name} must be an integer from 1 to 65535`,
      );
    }
    return parsed;
  };
  return {
    port: port('PORT'),
    database: {
      host: required('DB_HOST'),
      port: port('DB_PORT'),
      username: required('DB_USER'),
      password: required('DB_PASSWORD'),
      database: required('DB_NAME'),
    },
  };
}

export type ApplicationConfiguration = ReturnType<typeof loadConfiguration>;
