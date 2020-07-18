/**
 * @jest-environment node
 */

import * as request from 'supertest';
import { Application } from '../../server/app/Application';

describe("test base api route '/' ", () => {
  const app = new Application();
  it('returns a 200 status code', async () => {
    const res = await request.agent(app.app).get('/');
    expect(res.status).toEqual(200);
  });
});
