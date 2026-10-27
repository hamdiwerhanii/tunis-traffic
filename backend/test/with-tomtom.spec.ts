import type { MockInstance } from 'vitest';
import { createTestApp, jsonResponse, TestApp } from './support/create-test-app.js';

const KEY = 'test-tomtom-key-123';
const ROUTE = '/api/routes?fromLat=36.8065&fromLng=10.1815&toLat=36.851&toLng=10.2272';
const TUNIS_TILE = '/api/traffic/tiles/flow/13/4327/3193';
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const tomtomRoute = (seconds: number, delay: number, length: number) => ({
  summary: {
    lengthInMeters: length,
    travelTimeInSeconds: seconds,
    trafficDelayInSeconds: delay,
    departureTime: '2026-10-23T07:40:00+01:00',
    arrivalTime: '2026-10-23T08:00:00+01:00',
  },
  legs: [
    {
      points: [
        { latitude: 36.8065, longitude: 10.1815 },
        { latitude: 36.851, longitude: 10.2272 },
      ],
    },
  ],
});

describe('routes and traffic with a TomTom key', () => {
  let t: TestApp;
  let fetchSpy: MockInstance<typeof fetch>;

  beforeAll(async () => {
    t = await createTestApp({ TOMTOM_API_KEY: KEY });
  });

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => fetchSpy.mockRestore());
  afterAll(() => t.close());

  it('picks the fastest TomTom route and never leaks the key', async () => {
    fetchSpy.mockResolvedValueOnce(
      jsonResponse({ routes: [tomtomRoute(1500, 60, 12000), tomtomRoute(1200, 420, 10400)] }),
    );

    const res = await t.http().get(ROUTE).expect(200);

    expect(res.body).toMatchObject({
      provider: 'tomtom',
      liveTraffic: true,
      durationMinutes: 20,
      delayMinutes: 7,
      distanceKm: 10.4,
    });
    expect(fetchSpy.mock.calls[0][0] as string).toContain('traffic=true');
    expect(JSON.stringify(res.body)).not.toContain(KEY);
  });

  it('reports live traffic as on', async () => {
    await t.http().get('/api/traffic/status').expect(200, { liveTraffic: true });
  });

  it('proxies and caches traffic tiles over Tunisia', async () => {
    fetchSpy.mockResolvedValue(new Response(PNG, { headers: { 'Content-Type': 'image/png' } }));

    const first = await t.http().get(TUNIS_TILE).expect(200);
    await t.http().get(TUNIS_TILE).expect(200);

    expect(first.headers['content-type']).toBe('image/png');
    expect(first.headers['cache-control']).toBe('public, max-age=60');
    expect(Buffer.compare(first.body as Buffer, PNG)).toBe(0);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0] as string).toContain('/flow/relative/13/4327/3193.png');
  });

  it.each([
    ['a tile over Paris', '/api/traffic/tiles/flow/13/4149/2818', 404],
    ['an unknown layer', '/api/traffic/tiles/weather/13/4327/3193', 400],
    ['a zoom level that is too low', '/api/traffic/tiles/flow/3/4/3', 400],
    ['coordinates outside the zoom level', '/api/traffic/tiles/flow/6/99/99', 400],
  ])('refuses %s', async (_label, url, status) => {
    await t.http().get(url).expect(status);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
