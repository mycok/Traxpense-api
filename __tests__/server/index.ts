/**
 * @jest-environment node
 */

import * as request from 'supertest';
import { app } from '../../server/server';

describe("test base api route '/' ", () => {
  it('returns a 200 status code', async () => {
    const res = await request.agent(app).get('/');
    expect(res.status).toEqual(200);
  });
});
