import { createTestApp, TestApp } from './support/create-test-app.js';

describe('anonymous session and health', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(() => t.close());

  it('reports the API and the database as healthy', async () => {
    await t.http().get('/api/health').expect(200, { status: 'ok' });
  });

  it('gives every new browser an httpOnly session cookie', async () => {
    const res = await t.http().get('/api/favorites').expect(200);
    const cookie = String(res.headers['set-cookie']);

    expect(cookie).toMatch(/tt_session=[0-9a-f-]{36}/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it('keeps a valid session and replaces a forged one', async () => {
    const agent = t.agent();
    await agent.get('/api/favorites').expect(200);
    const again = await agent.get('/api/favorites').expect(200);
    expect(again.headers['set-cookie']).toBeUndefined();

    const forged = await t
      .http()
      .get('/api/favorites')
      .set('Cookie', 'tt_session=not-a-uuid')
      .expect(200);
    expect(String(forged.headers['set-cookie'])).toMatch(/tt_session=[0-9a-f-]{36}/);
  });

  it('sends security headers', async () => {
    const res = await t.http().get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('answers unknown routes with 404', async () => {
    await t.http().get('/api/nope').expect(404);
  });
});
