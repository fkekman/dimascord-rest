import { loadConfiguration } from '../configuration';
import { databaseOptions } from './database.options';

describe('database connection options', () => {
  it('never changes the schema at startup and discovers only production TypeScript files', () => {
    const options = databaseOptions(
      loadConfiguration(
        {
          PORT: '3000',
          DB_HOST: 'localhost',
          DB_PORT: '5432',
          DB_USER: 'app',
          DB_PASSWORD: 'password',
          DB_NAME: 'app',
        },
        '/nonexistent.env',
      ),
    );
    expect(options.synchronize).toBe(false);
    expect(options.migrationsRun).toBe(false);
    expect(options.entities).toEqual([
      expect.stringMatching(/\/src\/\*\*\/\*\.entity\.ts$/),
    ]);
    expect(options.migrations).toEqual([
      expect.stringMatching(/\/src\/database\/migrations\/\*\.ts$/),
    ]);
  });
});
