#!/usr/bin/env node

const { execSync } = require('child_process');

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Error: You must provide a migration name!');
  process.exit(1);
}

execSync(
  `yarn typeorm:cli migration:generate src/migrations/${migrationName}`,
  { stdio: 'inherit' },
);
