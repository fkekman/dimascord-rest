// Fixed credentials belong only to compose.test.yaml. Never inherit the working DB.
export const testEnvironment = {
  DB_HOST: '127.0.0.1',
  DB_PORT: '55432',
  DB_USER: 'dimascord_test',
  DB_PASSWORD: 'test-only-password',
  DB_NAME: 'dimascord_test',
  PORT: '3000',
};

export function assertTestEnvironment(environment: NodeJS.ProcessEnv): void {
  for (const [key, value] of Object.entries(testEnvironment)) {
    if (key.startsWith('DB_') && environment[key] !== value) {
      throw new Error(`Unsafe test database configuration: ${key}`);
    }
  }
}
