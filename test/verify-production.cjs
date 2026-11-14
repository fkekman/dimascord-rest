const assert = require('node:assert/strict');
const fs = require('node:fs');

async function verify() {
  for (const path of [
    '.env',
    'test',
    'src',
    'node_modules/ts-node',
    'node_modules/typescript',
    'node_modules/@nestjs/cli',
  ]) {
    assert.equal(
      fs.existsSync(path),
      false,
      `Unexpected production path: ${path}`,
    );
  }
  for (const path of fs.readdirSync('dist', { recursive: true })) {
    assert.doesNotMatch(path, /probe|spec|test/i);
    if (fs.statSync(`dist/${path}`).isFile()) {
      assert.equal(
        fs.readFileSync(`dist/${path}`, 'utf8').includes('database_probe'),
        false,
      );
    }
  }
  const source = require('/app/dist/database/data-source.js').default;
  assert.equal(source.options.synchronize, false);
  assert.equal(source.options.migrationsRun, false);
  assert.match(source.options.entities[0], /\.entity\.js$/);
  assert.match(source.options.migrations[0], /migrations\/\*\.js$/);
  try {
    await source.initialize();
    assert.equal(source.migrations.length, 0);
    assert.equal(source.entityMetadatas.length, 0);
    assert.deepEqual(
      await source.query('SELECT to_regclass($1) AS name', [
        'public.database_probe',
      ]),
      [{ name: null }],
    );
  } finally {
    if (source.isInitialized) await source.destroy();
  }
  console.log('Production artifact and DataSource checks passed');
}

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
