import { spawnSync } from 'node:child_process'

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const result = spawnSync(command, ['vitest', 'run', 'tests/coverage.test.ts'], {
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
