import http from 'http';
import { beforeAll, afterAll, test, expect, vi } from 'vitest';

// Import after server starts and after we spy on auth.refresh below
let port: number;
let server: http.Server;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    let protectedCalls = 0;
    server = http.createServer((req, res) => {
      if (!req.url) {
        res.writeHead(404);
        return res.end();
      }
      if (req.url === '/protected') {
        protectedCalls++;
        if (protectedCalls === 1) {
          res.writeHead(401);
          return res.end('unauthorized');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      }
      if (req.url === '/api/auth/refresh' && req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ refreshed: true }));
      }
      res.writeHead(404);
      res.end();
    }).listen(0, () => {
      // @ts-ignore - address() may return string on Windows, but port is number in tests
      port = (server.address() as any).port;
      resolve();
    });
  });
});

afterAll(() => {
  server.close();
});

test('fetchWithAuth retries after refresh', async () => {
  // Spy on auth.refresh to call our test server's refresh endpoint
  const auth = await import('../auth');
  // Simulate a successful refresh to focus this test on retry logic.
  vi.spyOn(auth, 'refresh').mockImplementation(async () => true);

  const { default: fetchWithAuth } = await import('../fetcher');

  const res = await fetchWithAuth(`http://127.0.0.1:${port}/protected`, { method: 'GET' });
  expect(res.ok).toBe(true);
  const json = await res.json();
  expect(json).toEqual({ ok: true });
});
