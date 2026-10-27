import type { MockInstance } from 'vitest';
import { createTestApp, jsonResponse, TestApp } from './support/create-test-app.js';

const ROUTE = '/api/routes?fromLat=36.8065&fromLng=10.1815&toLat=36.851&toLng=10.2272';

const osrmRoute = {
  code: 'Ok',
  routes: [
    {
      distance: 9876,
      duration: 900,
      geometry: {
        coordinates: [
          [10.1815, 36.8065],
          [10.2272, 36.851],
        ],
      },
    },
  ],
};

describe('routes and traffic without a TomTom key', () => {
  let t: TestApp;
  let fetchSpy: MockInstance<typeof fetch>;

  beforeAll(async () => {
    t = await createTestApp({ TOMTOM_API_KEY: '' });
  });

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => fetchSpy.mockRestore());
  afterAll(() => t.close());

  it('plans the route with OSRM and says there is no live traffic', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(osrmRoute));

    const res = await t.http().get(ROUTE).expect(200);

    expect(res.body).toMatchObject({
      provider: 'osrm',
      liveTraffic: false,
      distanceKm: 9.9,
      durationMinutes: 15,
      delayMinutes: 0,
      path: [
        [36.8065, 10.1815],
        [36.851, 10.2272],
      ],
    });
    expect(fetchSpy.mock.calls[0][0] as string).toContain(
      '/route/v1/driving/10.1815,36.8065;10.2272,36.851',
    );
  });

  it('works out when to leave for a chosen arrival time', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(osrmRoute));
    const arriveAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    arriveAt.setSeconds(0, 0);

    const res = await t
      .http()
      .get(`${ROUTE}&arriveAt=${encodeURIComponent(arriveAt.toISOString())}`)
      .expect(200);

    expect(res.body.arriveAt).toBe(arriveAt.toISOString());
    expect(new Date(res.body.departAt).getTime()).toBe(arriveAt.getTime() - 900 * 1000);
  });

  it.each([
    ['an arrival in the past', `${ROUTE}&arriveAt=2020-01-01T08:00:00Z`],
    [
      'an arrival in two weeks',
      `${ROUTE}&arriveAt=${new Date(Date.now() + 14 * 864e5).toISOString()}`,
    ],
    [
      'a start outside Tunisia',
      '/api/routes?fromLat=48.85&fromLng=2.35&toLat=36.851&toLng=10.2272',
    ],
    ['missing coordinates', '/api/routes?fromLat=36.8'],
  ])('rejects %s', async (_label, url) => {
    await t.http().get(url).expect(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('answers 503 when OSRM finds no route', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ code: 'NoRoute', routes: [] }));
    await t.http().get(ROUTE).expect(503);
  });

  it('reports live traffic as off and serves no tiles', async () => {
    await t.http().get('/api/traffic/status').expect(200, { liveTraffic: false });
    await t.http().get('/api/traffic/tiles/flow/13/4467/3227').expect(404);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
