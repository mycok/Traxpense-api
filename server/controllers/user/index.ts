import { Request, Response } from 'express';
import { EventEmitter } from 'events';

import userSchema from '../../validation/schemas/user/create.json';
import profileSchema from '../../validation/schemas/user/profile.json';
import updateSchema from '../../validation/schemas/user/update.json';
import {
  UserDataAgent,
  IUserDataAgent,
} from '../../database/data-agents/user/UserDataAgent';
import { BadRequestError } from '../../extensions/BadRequestError';
import { NotFoundError } from '../../extensions/NotFoundError';
import { IUserDocument, UserModelResponse } from '../../database/data-abstracts';
import { generateToken } from '../../../utils/authUtils';
import { UserValidator } from '../../validation/validators/user';
import { hashPassword, doPasswordsMatch, makeSalt } from '../../../utils/passwordUtils';
import { walletController } from '../wallet';

type UserRequest = {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  profile?: {
    bio: string;
    summary: string;
    otherNames: {
      first: string;
      middle: string;
      last: string;
    };
  };
};

class UserController extends EventEmitter {
  private readonly _userDataAgent: IUserDataAgent;

  constructor(dataAgent: IUserDataAgent) {
    super();
    this._userDataAgent = dataAgent;
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.read = this.read.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.passwordReset = this.passwordReset.bind(this);
    this.getById = this.getById.bind(this);
    this.checkDuplicatesOnUpdate = this.checkDuplicatesOnUpdate.bind(this);
  }

  async create(req: any, res: Response): Promise<Response> {
    const { body } = req;
    const validationResults = new UserValidator().validate<UserRequest>(
      [userSchema, profileSchema],
      'user',
      body,
    );

    if (typeof validationResults === 'string') {
      return res.status(400).json(new BadRequestError('create', validationResults));
    }

    const salt = makeSalt();
    const hashedPassword = hashPassword(body.password, salt);

    const result = await this._userDataAgent.create({
      ...body,
      password: hashedPassword,
      salt,
    });

    if (typeof result === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('create', result as string).toJSON());
    }

    const token = generateToken(result._id, result.username, result.email);

    req.auth = result;

    this.emit('new_user_added', req);

    return res.status(201).json({
      success: true,
      user: new UserModelResponse(result).getResponseModel(),
      token,
    });
  }

  async list(req: Request, res: Response): Promise<Response> {
    const users: IUserDocument[] = await this._userDataAgent.list();

    return res.status(200).json({
      success: true,
      count: users.length,
      users:
        users.length > 0
          ? new UserModelResponse(users[0]).getResponseModelFromList(users)
          : users,
    });
  }

  async read(req: any, res: Response): Promise<Response> {
    const { user } = req;

    return res.status(200).json({
      success: true,
      user: {
        ...new UserModelResponse(user as IUserDocument).getResponseModel(),
      },
    });
  }

  async update(req: any, res: Response): Promise<Response> {
    const {
      body,
      user: { _id },
    } = req;

    const validationResults = new UserValidator().validate<UserRequest>(
      [updateSchema, profileSchema],
      'user',
      body,
    );

    if (typeof validationResults === 'string') {
      return res.status(400).json(new BadRequestError('update', validationResults));
    }

    const result = await this._userDataAgent.update(_id, body);

    if (typeof result !== 'object') {
      return res.status(400).json(new BadRequestError('update', result));
    }

    return res.status(200).json({
      success: true,
      user: new UserModelResponse(result).getResponseModel(),
    });
  }

  async delete(req: any, res: Response): Promise<Response> {
    const {
      user: { _id },
    } = req;

    const deletedResponse = await this._userDataAgent.delete(_id);

    if (typeof deletedResponse === 'string') {
      return res.status(400).json(new BadRequestError('delete', deletedResponse));
    }

    return res.status(200).json({
      success: true,
      deletedResponse,
    });
  }

  async passwordReset(req: any, res: Response): Promise<Response> {
    const {
      user,
      body: { oldPassword, newPassword },
    } = req;

    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!doPasswordsMatch(oldPassword, user.password, user.salt)) {
      return res
        .status(400)
        .json(new BadRequestError('password-reset', "Passwords don't match"));
    }

    if (!re.test(newPassword)) {
      return res
        .status(400)
        .json(
          new BadRequestError(
            'password-reset',
            'A password must contain a minimum of 8 characters including atleast one an uppercase, lowercase, number and a special character!',
          ),
        );
    }

    const hashedPassword = hashPassword(newPassword, user.salt);

    const result = await this._userDataAgent.reset(user._id, hashedPassword);

    if (typeof result === 'string') {
      return res.status(400).json(new BadRequestError('password-reset', result));
    }

    return res.status(200).json({ success: true });
  }

  /**
   * Middleware
   *
   * @param req
   * @param res
   * @param next
   * @param userId
   * @return
   *
   * Retrieves a specific user using the provided [userId]
   * and attaches it to the request under the user property.
   * It should be attached to the param handler property of an express router instance
   */
  async getById(req: any, res: Response, next: Function, userId: string): Promise<any> {
    const user = await this._userDataAgent.getById(userId);

    if (!user) {
      return res
        .status(404)
        .json(new NotFoundError('getById', 'User not found').toJSON());
    }

    req.user = new UserModelResponse(user).getFullModelResponse();

    return next();
  }

  /**
   * Middleware
   *
   * @param req
   * @param res
   * @param next
   *
   * Checks for username and email duplicates during an update operation
   */
  async checkDuplicatesOnUpdate(
    req: Request,
    res: Response,
    next: Function,
  ): Promise<any> {
    const { body } = req;

    const propertiesToUpdate = Object.keys(body);

    const duplicates: Array<any> = await this._userDataAgent.pushDuplicatesToArray(
      propertiesToUpdate,
      body,
    );

    if (duplicates.length > 0) {
      return res.status(400).json({
        duplicates: duplicates.length,
        dupErrors: duplicates,
      });
    }

    return next();
  }
}

export const userController = new UserController(new UserDataAgent());
userController.on('new_user_added', walletController.create);
