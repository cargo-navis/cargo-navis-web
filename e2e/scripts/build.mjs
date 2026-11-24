// Production build for the E2E tests (npm run e2e:build), with the environment from e2e/env.mjs.
import { spawnSync } from 'node:child_process';

import { e2eEnv } from '../env.mjs';

const result = spawnSync('npx', ['next', 'build', '--webpack'], {
  stdio: 'inherit',
  env: { ...process.env, ...e2eEnv },
});
process.exit(result.status ?? 1);
