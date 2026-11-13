import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

let child;
let origin;
before(async () => {
  child = spawn(process.execPath, ['server.mjs'], { cwd: new URL('..', import.meta.url), env: {...process.env, PORT:'0'}, stdio:['ignore','pipe','pipe'] });
  origin = await new Promise((resolve,reject) => {
    let output = '';
    const timeout = setTimeout(() => { child.kill(); reject(new Error('El servidor no arrancó.')); }, 5000);
    child.once('error', reject);
    child.stdout.on('data', chunk => {
      output += chunk;
      const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timeout); resolve(match[0]); }
    });
  });
});
after(async () => { if (child && child.exitCode === null) { const ended = once(child,'exit'); child.kill(); await ended; } });

test('local app, ES modules and fictional site are served with usable content types', async () => {
  for (const [path,type] of [['/','text/html'],['/src/app.js','text/javascript'],['/src/model.js','text/javascript'],['/src/styles.css','text/css'],['/example/','text/html'],['/example/styles.css','text/css']]) {
    const response = await fetch(origin+path);
    assert.equal(response.status,200,path);
    assert.ok(response.headers.get('content-type').startsWith(type),path);
    assert.ok((await response.text()).length > 100,path);
  }
});

test('the local server does not expose repository files or accept submissions', async () => {
  for (const path of ['/README.md','/package.json','/.git/config','/server.mjs','/src/%2e%2e/server.mjs','/missing']) {
    const response = await fetch(origin+path);
    assert.equal(response.status,404,path);
  }
  const response = await fetch(origin+'/', { method:'POST',body:'should-not-be-stored' });
  assert.equal(response.status,405);
});

test('pages disallow external connections and script injection by default', async () => {
  const response = await fetch(origin+'/');
  assert.match(response.headers.get('content-security-policy'),/connect-src 'none'/);
  assert.match(response.headers.get('content-security-policy'),/script-src 'self'/);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
});
