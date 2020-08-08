import { Application } from '../../server/app/Application';
import { MongooseAccess } from '../../server/database/adaptors/MongoAccess';
import { IUserDocument } from '../../server/database/data-abstracts/user/IUserDocument';
import UserModelFixture, { chaiWithHttp, expect } from './fixtures';
import { hashPassword, makeSalt } from '../../utils/passwordUtils';

const baseUrl = '/api/v1';
/*
    TODO:
    - test presence of both old and new password
  */
describe('reset password', () => {
  let user: IUserDocument;

  before(async () => {
    const salt = makeSalt();
    const hashedPassword = hashPassword(
      UserModelFixture.validUserObject.password,
      salt,
    );
    user = await MongooseAccess.mongooseConnection.models.User.create({
      ...UserModelFixture.validUserObject,
      password: hashedPassword,
      salt,
    });
  });

  after(async () => {
    await MongooseAccess.mongooseConnection.models.User.deleteMany({});
  });

  const app = new Application();
  describe("when a request is made to reset a user's password with a wrong old password", () => {
    it('a bad request error should be returned', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .patch(`${baseUrl}/reset/${user.id}`)
        .send({ oldPassword: 'passWord@23', newPassword: 'nnewpaSSword#23' });

      expect(res.status).to.be.equal(400);
      expect(res.body.message).to.be.equal("passwords don't match");
    });
  });

  describe("when a request is made to reset a user's password with an invalid new password", () => {
    it('a bad request error should be returned', async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .patch(`${baseUrl}/reset/${user.id}`)
        .send({
          oldPassword: UserModelFixture.validUserObject.password,
          newPassword: 'nnewpaSSword23',
        });

      expect(res.status).to.be.equal(400);
      expect(res.body.message).to.be.equal(
        'A password must contain a minimum of 8 characters including atleast one an uppercase, lowercase, number and a special character!',
      );
    });
  });

  describe("when a request is made to reset a user's password with all valid properties", () => {
    it("the user's password should be successfully reset", async () => {
      const res = await chaiWithHttp
        .request(app.app)
        .patch(`${baseUrl}/reset/${user.id}`)
        .send({
          oldPassword: UserModelFixture.validUserObject.password,
          newPassword: 'nnewpaSSword#23',
        });

      expect(res.status).to.be.equal(200);
    });
  });
});
