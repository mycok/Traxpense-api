import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture from '../user/fixtures';
import { expect, chaiWithHttp } from '..';
import { hashPassword, makeSalt } from '../../utils/passwordUtils';

const baseUrl = '/api/v1/auth';
describe('login', () => {
  const salt = makeSalt();
  const hashedPassword = hashPassword(
    UserModelFixture.validUserObject.password,
    salt,
  );

  before(() => {
    MongooseAccess.connect(process.env.TEST_MONGODB_URI);
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({});
  });

  const app = new Application();
  describe('when a request contains all the valid required properties', () => {
    beforeEach(async () => {
      await MongooseAccess.mongooseConnection.models.User.create({
        ...UserModelFixture.validUserObject,
        password: hashedPassword,
        salt,
      });
    });
    it('a user should successfully signin', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .post(`${baseUrl}/sign-in`)
        .send({
          email: UserModelFixture.validUserObject.email,
          password: UserModelFixture.validUserObject.password,
        });

      expect(res.status).to.be.equal(200);
    });
  });

  describe('when a request is missing a required property', () => {
    it('a bad request error with the missing property message should be returned', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .post(`${baseUrl}/sign-in`)
        .send({
          email: UserModelFixture.validUserObject.email,
        });

      expect(res.status).to.be.equal(400);
      expect(res.body.message).to.be.equal(
        "The 'signin.password' field is missing",
      );
    });
  });

  describe('when a request has a non existing email property', () => {
    it("a bad request error with the 'email not found' message should be returned", async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .post(`${baseUrl}/sign-in`)
        .send({
          email: 'testemail@now.me',
          password: UserModelFixture.validUserObject.password,
        });

      expect(res.status).to.be.equal(400);
      expect(res.body.message).to.be.equal('email not found');
    });
  });

  describe('when a request has a non existing password property', () => {
    it("a bad request error with the 'password mis-match' message should be returned", async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .post(`${baseUrl}/sign-in`)
        .send({
          email: UserModelFixture.validUserObject.email,
          password: 'paSsworD@23',
        });

      expect(res.status).to.be.equal(400);
      expect(res.body.message).to.be.equal("passwords don't match");
    });
  });
});
