import { AIRPORT, BARDO, createTestApp, TestApp } from './support/create-test-app.js';

describe('favorites', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterEach(() => t.resetDatabase());
  afterAll(() => t.close());

  it('saves, lists and removes a favorite for the current session only', async () => {
    const me = t.agent();
    const created = await me.post('/api/favorites').send(AIRPORT).expect(201);

    expect(created.body).toEqual({
      id: expect.any(String),
      name: AIRPORT.name,
      address: null,
      lat: AIRPORT.lat,
      lng: AIRPORT.lng,
      createdAt: expect.any(String),
    });
    expect(created.body).not.toHaveProperty('sessionId');

    const list = await me.get('/api/favorites').expect(200);
    expect(list.body).toHaveLength(1);

    await me.delete(`/api/favorites/${created.body.id}`).expect(204);
    await me.get('/api/favorites').expect(200, []);
  });

  it('never shows or deletes the favorites of another browser', async () => {
    const me = t.agent();
    const stranger = t.agent();
    const created = await me.post('/api/favorites').send(AIRPORT).expect(201);

    await stranger.get('/api/favorites').expect(200, []);
    await t.http().get('/api/favorites').expect(200, []);
    await stranger.delete(`/api/favorites/${created.body.id}`).expect(404);

    const mine = await me.get('/api/favorites').expect(200);
    expect(mine.body).toHaveLength(1);
  });

  it('refuses the same place twice', async () => {
    const me = t.agent();
    await me.post('/api/favorites').send(AIRPORT).expect(201);
    const res = await me.post('/api/favorites').send(AIRPORT).expect(409);
    expect(res.body.message).toMatch(/already in your favorites/);
  });

  it('sorts favorites from newest to oldest', async () => {
    const me = t.agent();
    await me.post('/api/favorites').send(AIRPORT).expect(201);
    await me.post('/api/favorites').send(BARDO).expect(201);

    const list = await me.get('/api/favorites').expect(200);
    expect(list.body.map((favorite: { name: string }) => favorite.name)).toEqual([
      BARDO.name,
      AIRPORT.name,
    ]);
  });

  it.each([
    [{ ...AIRPORT, name: '' }, 'name'],
    [{ ...AIRPORT, name: 'x'.repeat(121) }, 'name'],
    [{ ...AIRPORT, lat: 48.85 }, 'lat'],
    [{ ...AIRPORT, lng: 'ten' }, 'lng'],
    [{ ...AIRPORT, sessionId: 'someone-else' }, 'sessionId'],
  ])('rejects invalid input %#', async (body, field) => {
    const res = await t.agent().post('/api/favorites').send(body).expect(400);
    expect(JSON.stringify(res.body.message)).toContain(field);
  });

  it('rejects malformed ids', async () => {
    await t.agent().delete('/api/favorites/not-an-id').expect(400);
  });

  it('limits each session to 50 favorites', async () => {
    const me = t.agent();
    for (let i = 0; i < 50; i += 1) {
      await me
        .post('/api/favorites')
        .send({ name: `Place ${i}`, lat: 36.8 + i / 1000, lng: 10.18 })
        .expect(201);
    }
    const res = await me
      .post('/api/favorites')
      .send({ name: 'One too many', lat: 36.9, lng: 10.2 })
      .expect(400);
    expect(res.body.message).toMatch(/up to 50/);
  });
});
