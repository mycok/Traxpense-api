import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import UserModelFixture, { expect, createUser } from './fixtures';

const baseUrl = '/api/v1';
describe('create user', () => {
  before(() => {
    MongooseAccess.connect('mongodb://localhost:27017/test');
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({});
  });

  const app = new Application();
  describe('when a request contains all the required properties', () => {
    it('a new user should be successfully created', async () => {
      const res = await createUser(
        app,
        baseUrl,
        UserModelFixture.validUserObject,
      );

      expect(res.status).to.be.equal(201);
      expect(res.body.user).to.have.property(
        'email',
        'somerandomemail@test.now',
      );
    });
  });

  describe('when a request is missing some required properties', () => {
    it('a bad request error with the missing property message should be returned', async () => {
      const res = await createUser(
        app,
        baseUrl,
        UserModelFixture.UserObjectWithLessThanRequiredParams,
      );

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.equal(false);
      expect(res.body.message).to.be.equal(
        "The 'user.password' field is missing",
      );
    });
  });

  describe('when a request contains more than the required properties', () => {
    it('a bad request error with the excess property message should be returned', async () => {
      const res = await createUser(
        app,
        baseUrl,
        UserModelFixture.UserObjectWithMoreThanRequiredParams,
      );

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.equal(false);
      expect(res.body.message).to.be.equal(
        "The 'user' object does not support the field 'hobbies'",
      );
    });
  });

  describe('when a request contains a username as an empty string', () => {
    it('a bad request error with the character length message should be returned', async () => {
      const res = await createUser(
        app,
        baseUrl,
        UserModelFixture.UserObjectWithNameAsEmptyString,
      );

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.equal(false);
      expect(res.body.message).to.be.equal(
        "The 'user.username' field should NOT be shorter than 2 characters",
      );
    });
  });

  describe('when a request contains an invalid email format', () => {
    it('a bad request error with an invalid email format message should be returned', async () => {
      const res = await createUser(
        app,
        baseUrl,
        UserModelFixture.userWithInvalidEmailFormat,
      );

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.equal(false);
      expect(res.body.message).to.be.equal(
        "The 'user.email' field must be a valid email",
      );
    });
  });

  describe('when a request contains an invalid password format', () => {
    it('a bad request error with an invalid password format message should be returned', async () => {
      const res = await createUser(
        app,
        baseUrl,
        UserModelFixture.userWithInvalidPasswordFormat,
      );

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.equal(false);
      expect(res.body.message).to.be.equal(
        "The 'user.password' field should contain atleast 8 characters with a lowercase, uppercase, a number and a special character",
      );
    });
  });

  describe('when a request contains an invalid username type', () => {
    it('a bad request error with an invalid username type message should be returned', async () => {
      const res = await createUser(
        app,
        baseUrl,
        UserModelFixture.userWithInvalidUsernameType,
      );

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.equal(false);
      expect(res.body.message).to.be.equal(
        "The 'user.username' field must be of type string",
      );
    });
  });

  describe('when a request contains a username that is already available in the system ', () => {
    it('a bad request error with a duplicate message should be returned', async () => {
      const res = await createUser(
        app,
        baseUrl,
        UserModelFixture.validUserObject,
      );

      expect(res.status).to.be.equal(400);
      expect(res.body.success).to.be.equal(false);
    });
  });
});
