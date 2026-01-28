import { spawn } from 'node:child_process';

const port = process.env.PORT || '8000';

const child = spawn(
  'npx',
  ['http-server', '.', '-a', '0.0.0.0', '-p', String(port), '-c-1'],
  { stdio: 'inherit', shell: true }
);

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
