import { withDatabaseProbe } from './test-data-source';
import { createTestDataSource } from './test-data-source';

describe('isolated PostgreSQL migrations', () => {
  it('cleans up after a failed check and closes the failed session', async () => {
    let failedSource: ReturnType<typeof createTestDataSource> | undefined;
    await expect(
      withDatabaseProbe(async (source) => {
        failedSource = source;
        const result: unknown = await source.query(
          'SELECT current_database() AS name, current_user AS username',
        );
        expect(result).toEqual([
          { name: 'dimascord_test', username: 'dimascord_test' },
        ]);
        throw new Error('simulated assertion failure');
      }),
    ).rejects.toThrow('simulated assertion failure');
    expect(failedSource?.isInitialized).toBe(false);
    const source = createTestDataSource();
    await source.initialize();
    const runner = source.createQueryRunner();
    try {
      expect(await runner.hasTable('database_probe')).toBe(false);
      expect(await runner.hasTable('database_test_migrations')).toBe(false);
    } finally {
      await runner.release();
      await source.destroy();
    }
  });
  it('applies, reads, reports, repeats and reverts the test migration', async () => {
    await withDatabaseProbe(async (source) => {
      const runner = source.createQueryRunner();
      try {
        expect(await runner.hasTable('database_probe')).toBe(true);
        expect(await source.showMigrations()).toBe(false);
        const started = Date.now();
        const inserted: unknown = await source.query(
          'INSERT INTO database_probe DEFAULT VALUES RETURNING id, created_at',
        );
        expect(inserted).toEqual([
          { id: expect.any(Number), created_at: expect.any(Date) },
        ]);
        expect(inserted).toEqual([{ id: 1, created_at: expect.any(Date) }]);
        const timestamps: { valid: boolean }[] = await source.query(
          'SELECT created_at >= to_timestamp($1) AND created_at <= CURRENT_TIMESTAMP AS valid FROM database_probe',
          [started / 1000 - 1],
        );
        expect(timestamps).toEqual([{ valid: true }]);
        expect(
          await source.query('SELECT id, created_at FROM database_probe'),
        ).toEqual(inserted);
        expect(await source.runMigrations()).toEqual([]);
        await source.undoLastMigration();
        expect(await runner.hasTable('database_probe')).toBe(false);
        expect(await source.showMigrations()).toBe(true);
      } finally {
        await runner.release();
      }
    });
  });
});
