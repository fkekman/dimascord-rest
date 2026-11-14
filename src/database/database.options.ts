import type { DataSourceOptions } from 'typeorm';
import type { ApplicationConfiguration } from '../configuration';
import { extname, join } from 'node:path';

export function databaseOptions(
  config: ApplicationConfiguration,
): DataSourceOptions {
  const extension = extname(__filename).slice(1);
  return {
    type: 'postgres',
    ...config.database,
    entities: [join(__dirname, '..', '**', `*.entity.${extension}`)],
    migrations: [join(__dirname, 'migrations', `*.${extension}`)],
    synchronize: false,
    migrationsRun: false,
  };
}
