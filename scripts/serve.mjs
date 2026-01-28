import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const preferredPorts = [8000, 8001, 8002, 8003, 8004];

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = net.createConnection({ port, host: '127.0.0.1' });

    const done = (result) => {
      resolve(result);
    };

    probe.setTimeout(250);

    probe.once('connect', () => {
      probe.end();
      done(false);
    });

    probe.once('timeout', () => {
      probe.destroy();
      // Se não respondeu, ainda pode estar em uso. Vamos tentar bind.
      const server = net
        .createServer()
        .once('error', () => done(false))
        .once('listening', () => server.close(() => done(true)))
        .listen(port);
    });

    probe.once('error', () => {
      // Conexão recusada geralmente indica que está livre; confirmamos com bind.
      const server = net
        .createServer()
        .once('error', () => done(false))
        .once('listening', () => server.close(() => done(true)))
        .listen(port);
    });
  });
}

async function pickPort() {
  for (const port of preferredPorts) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port)) return port;
  }
  return 0;
}

const port = await pickPort();
if (!port) {
  console.error(
    `Nenhuma porta livre encontrada em: ${preferredPorts.join(', ')}. Tente fechar processos usando essas portas ou edite scripts/serve.mjs.`
  );
  process.exit(1);
}

const url = `http://localhost:${port}`;
console.log(`
Frontend iniciado em: ${url}
`);

const httpServerBin = fileURLToPath(
  new URL('../node_modules/http-server/bin/http-server', import.meta.url)
);

const child = spawn(process.execPath, [httpServerBin, '.', '-p', String(port), '-c-1', '-o'], {
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 0));
