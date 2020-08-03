/**
 * @jest-environment node
 */

import * as request from 'supertest';

import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';

describe("test base api route '/' ", () => {
  afterAll(async () => {
    await MongooseAccess.close();
  });

  const app = new Application();
  it('returns a 200 status code', async () => {
    const res = await request.agent(app.app).get('/');
    expect(res.status).toEqual(200);
  });
});
