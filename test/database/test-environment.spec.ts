import { assertTestEnvironment, testEnvironment } from './test-environment';

describe('test database safety', () => {
  it('accepts only the dedicated local test database identity', () => {
    expect(() => assertTestEnvironment(testEnvironment)).not.toThrow();
    for (const key of [
      'DB_HOST',
      'DB_PORT',
      'DB_USER',
      'DB_NAME',
      'DB_PASSWORD',
    ]) {
      expect(() =>
        assertTestEnvironment({
          ...testEnvironment,
          [key]: 'working-database',
        }),
      ).toThrow(key);
    }
    expect(() => assertTestEnvironment({})).toThrow('DB_HOST');
  });
});
