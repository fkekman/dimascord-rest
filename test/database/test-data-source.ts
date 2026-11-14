import { DataSource } from 'typeorm';
import { loadConfiguration } from '../../src/configuration';
import { databaseOptions } from '../../src/database/database.options';
import { DatabaseProbe1794614400000 } from './probe.migration';
import { assertTestEnvironment, testEnvironment } from './test-environment';

async function assertProbeRemoved(source: DataSource): Promise<void> {
  const runner = source.createQueryRunner();
  try {
    if (await runner.hasTable('database_probe')) {
      throw new Error('database_probe was not cleaned up');
    }
  } finally {
    await runner.release();
  }
}

export function createTestDataSource(): DataSource {
  assertTestEnvironment(process.env);
  return new DataSource({
    ...databaseOptions(
      loadConfiguration(testEnvironment, '/nonexistent-test.env'),
    ),
    entities: [],
    migrations: [DatabaseProbe1794614400000],
    migrationsTableName: 'database_test_migrations',
  });
}

export async function withDatabaseProbe(
  check: (source: DataSource) => Promise<void>,
): Promise<void> {
  const source = createTestDataSource();
  try {
    await source.initialize();
    await source.runMigrations();
    await check(source);
  } finally {
    if (source.isInitialized) {
      try {
        await source.query('DROP TABLE IF EXISTS database_probe');
        await source.query('DROP TABLE IF EXISTS database_test_migrations');
        await assertProbeRemoved(source);
      } finally {
        await source.destroy();
      }
    }
  }
}
