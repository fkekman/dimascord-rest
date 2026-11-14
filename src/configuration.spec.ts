import { loadConfiguration } from './configuration';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const valid = {
  PORT: '3000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USER: 'app',
  DB_PASSWORD: 'private-password',
  DB_NAME: 'dimascord',
};

describe('application configuration', () => {
  it('loads env files and gives process values priority, including empty overrides', () => {
    const directory = mkdtempSync(join(tmpdir(), 'dimascord-config-'));
    const file = join(directory, '.env');
    try {
      writeFileSync(
        file,
        Object.entries(valid)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n'),
      );
      expect(loadConfiguration({}, file)).toEqual({
        port: 3000,
        database: {
          host: 'localhost',
          port: 5432,
          username: 'app',
          password: 'private-password',
          database: 'dimascord',
        },
      });
      expect(
        loadConfiguration({ DB_HOST: 'postgres' }, file).database.host,
      ).toBe('postgres');
      expect(() => loadConfiguration({ DB_PASSWORD: '' }, file)).toThrow(
        'DB_PASSWORD',
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
  it.each(Object.keys(valid))('requires %s', (name) => {
    expect(() =>
      loadConfiguration({ ...valid, [name]: undefined }, '/nonexistent.env'),
    ).toThrow(name);
    expect(() =>
      loadConfiguration({ ...valid, [name]: '  ' }, '/nonexistent.env'),
    ).toThrow(name);
  });
  it.each(['PORT', 'DB_PORT'])(
    'rejects invalid %s values without exposing their contents',
    (name) => {
      for (const value of [
        '0',
        '65536',
        '-1',
        '1.5',
        'NaN',
        '3000suffix',
        'private-password',
        '',
      ]) {
        expect(() =>
          loadConfiguration({ ...valid, [name]: value }, '/nonexistent.env'),
        ).toThrow(name);
      }
    },
  );
  it('rejects missing database settings before connecting without leaking secrets', () => {
    expect(() =>
      loadConfiguration(
        { PORT: '3000', DB_PASSWORD: 'private-password' },
        '/nonexistent.env',
      ),
    ).toThrow('DB_HOST');
    try {
      loadConfiguration(
        { PORT: '3000', DB_PASSWORD: 'private-password' },
        '/nonexistent.env',
      );
    } catch (error) {
      expect(String(error)).not.toContain('private-password');
    }
  });
});
