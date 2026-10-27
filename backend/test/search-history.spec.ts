import { AIRPORT, BARDO, createTestApp, TestApp } from './support/create-test-app.js';

const search = (place: { name: string; lat: number; lng: number }) => ({
  query: place.name,
  placeName: place.name,
  lat: place.lat,
  lng: place.lng,
});

describe('search history', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterEach(() => t.resetDatabase());
  afterAll(() => t.close());

  it('records searches newest first and moves repeated places to the top', async () => {
    const me = t.agent();
    await me.post('/api/search-history').send(search(AIRPORT)).expect(201);
    await me.post('/api/search-history').send(search(BARDO)).expect(201);
    await me.post('/api/search-history').send(search(AIRPORT)).expect(201);

    const list = await me.get('/api/search-history').expect(200);
    expect(list.body.map((entry: { placeName: string }) => entry.placeName)).toEqual([
      AIRPORT.name,
      BARDO.name,
    ]);
    expect(list.body[0]).not.toHaveProperty('sessionId');
  });

  it('keeps only the 20 most recent places', async () => {
    const me = t.agent();
    for (let i = 0; i < 22; i += 1) {
      await me
        .post('/api/search-history')
        .send({ query: `Place ${i}`, lat: 36.8 + i / 100, lng: 10.18 })
        .expect(201);
    }

    const list = await me.get('/api/search-history?limit=20').expect(200);
    expect(list.body).toHaveLength(20);
    expect(list.body[0].query).toBe('Place 21');
  });

  it('clears only the history of the current browser', async () => {
    const me = t.agent();
    const stranger = t.agent();
    await me.post('/api/search-history').send(search(AIRPORT)).expect(201);
    await stranger.post('/api/search-history').send(search(BARDO)).expect(201);

    await t.http().delete('/api/search-history').expect(204);
    await me.delete('/api/search-history').expect(204);

    await me.get('/api/search-history').expect(200, []);
    const theirs = await stranger.get('/api/search-history').expect(200);
    expect(theirs.body).toHaveLength(1);
  });

  it.each(['0', '21', 'abc'])('rejects limit=%s', async (limit) => {
    await t.agent().get(`/api/search-history?limit=${limit}`).expect(400);
  });

  it('rejects places outside Tunisia', async () => {
    await t
      .agent()
      .post('/api/search-history')
      .send({ query: 'Paris', lat: 48.85, lng: 2.35 })
      .expect(400);
  });
});
