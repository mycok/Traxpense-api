import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, {
  chaiWithHttp,
  expect,
  createUser,
} from '../user/fixtures';

const baseUrl = '/api/v1';
describe('expense', () => {
  const app = new Application();
  let result: any;

  before(async () => {
    result = await createUser(app, baseUrl, UserModelFixture.validUserObject);
  });
  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({});
  });

  describe('when a request contains all the valid required properties', () => {
    it('an expense should be successfully recorded', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .post(`${baseUrl}/expenses`)
        .set('Authorization', `Bearer ${result.body.token}`)
        .send({
          title: 'test-expense',
          amount: 23400,
          category: 'testing',
        });

      expect(res.status).to.be.equal(201);
    });
  });

  describe('when a request contains all the invalid / missing required properties', () => {
    it('a bad request error should be returned', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .post(`${baseUrl}/expenses`)
        .set('Authorization', `Bearer ${result.body.token}`)
        .send({
          amount: 23400,
          category: 'testing',
        });

      expect(res.status).to.be.equal(400);
    });
  });
});
