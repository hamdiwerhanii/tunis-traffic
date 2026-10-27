import type { MockInstance } from 'vitest';
import { createTestApp, jsonResponse, TestApp } from './support/create-test-app.js';

const nominatimResults = [
  {
    place_id: 101,
    name: 'Bardo Museum',
    display_name: 'Bardo Museum, Le Bardo, Tunis, Tunisia',
    lat: '36.8094',
    lon: '10.1342',
  },
];

describe('place search', () => {
  let t: TestApp;
  let fetchSpy: MockInstance<typeof fetch>;

  beforeAll(async () => {
    t = await createTestApp({ CONTACT_EMAIL: 'dev@example.com' });
  });

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => fetchSpy.mockRestore());
  afterAll(() => t.close());

  it('returns simplified places and identifies itself to Nominatim', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(nominatimResults));

    const res = await t.http().get('/api/places?q=Bardo').expect(200);

    expect(res.body).toEqual([
      {
        id: '101',
        name: 'Bardo Museum',
        address: 'Bardo Museum, Le Bardo, Tunis, Tunisia',
        lat: 36.8094,
        lng: 10.1342,
      },
    ]);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('countrycodes=tn');
    expect(url).toContain('q=Bardo');
    expect((init.headers as Record<string, string>)['User-Agent']).toContain('dev@example.com');
  });

  it('serves repeated searches from the cache', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(nominatimResults));

    await t.http().get('/api/places?q=Medina').expect(200);
    await t.http().get('/api/places?q=medina').expect(200);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('answers 503 when Nominatim is down', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ error: 'down' }, 502));
    const res = await t.http().get('/api/places?q=Carthage').expect(503);
    expect(res.body.message).toMatch(/unavailable/);
  });

  it.each(['', 'a', 'x'.repeat(101)])('rejects the query "%s"', async (q) => {
    await t.http().get(`/api/places?q=${q}`).expect(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
