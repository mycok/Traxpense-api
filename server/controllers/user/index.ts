import { Request, Response } from 'express';

import userSchema from '../../validation/schemas/user/create.json';
import profileSchema from '../../validation/schemas/user/profile.json';
import updateSchema from '../../validation/schemas/user/update.json';
import { UserDataAgent } from '../../database/data-agents/user/UserDataAgent';
import { UserResponseModel } from '../../database/data-abstracts/user/UserResponseModel';
import { Validator } from '../../validation/validators';
import { BadRequestError } from '../../extensions/BadRequestError';
import { NotFoundError } from '../../extensions/NotFoundError';
import { IUserDocument } from '../../database/data-abstracts/user/IUserDocument';
import { generateToken } from '../../../utils/authUtils';
import {
  hashPassword,
  doPasswordsMatch,
  makeSalt,
} from '../../../utils/passwordUtils';

interface IUserRequest {
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
}

export class UserController {
  private static _userDataAgent = new UserDataAgent();

  static async create(req: Request, res: Response): Promise<any> {
    const { body } = req;
    const validationResults = Validator.validateUser<IUserRequest>(
      userSchema,
      profileSchema,
      'user',
      body,
    );

    if (typeof validationResults === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('create', validationResults));
    }
    const salt = makeSalt();
    const hashedPassword = hashPassword(body.password, salt);
    const result = await UserController._userDataAgent.create({
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
    return res.status(201).json({
      success: true,
      user: {
        ...new UserResponseModel(result).getResponseModel(),
      },
      token,
    });
  }

  static async list(req: Request, res: Response): Promise<any> {
    const users: IUserDocument[] = await UserController._userDataAgent.list();

    return res.status(200).json({
      success: true,
      count: users.length,
      users:
        users.length > 0
          ? new UserResponseModel(users[0]).getResponseModelFromList(users)
          : users,
    });
  }

  static async read(req: any, res: Response): Promise<any> {
    const { user } = req;

    return res.status(200).json({
      success: true,
      user: {
        ...new UserResponseModel(user as IUserDocument).getResponseModel(),
      },
    });
  }

  static async update(req: any, res: Response): Promise<any> {
    const {
      body,
      user: { _id },
    } = req;

    const validationResults = Validator.validateUser<IUserRequest>(
      updateSchema,
      profileSchema,
      'user',
      body,
    );

    if (typeof validationResults === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('update', validationResults));
    }

    const result = await UserController._userDataAgent.update(_id, body);

    if (typeof result !== 'object') {
      return res.status(400).json(new BadRequestError('update', result));
    }

    return res.status(200).json({
      success: true,
      user: new UserResponseModel(result).getResponseModel(),
    });
  }

  static async delete(req: any, res: Response): Promise<any> {
    const {
      user: { _id },
    } = req;

    const deletedResponse = await UserController._userDataAgent.delete(_id);

    if (typeof deletedResponse === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('delete', deletedResponse));
    }

    return res.status(200).json({
      success: true,
      deletedResponse,
    });
  }

  static async passwordReset(req: any, res: Response): Promise<any> {
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
    const result = await UserController._userDataAgent.reset(
      user._id,
      hashedPassword,
    );

    if (typeof result === 'string') {
      return res
        .status(400)
        .json(new BadRequestError('password-reset', result));
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
   *
   * Retrieves a specific user using the provided [userId]
   *  and attaches it to the request under the user property
   */
  static async getById(
    req: any,
    res: Response,
    next: Function,
    userId: string,
  ): Promise<any> {
    const user = await UserController._userDataAgent.getById(userId);

    if (!user) {
      return res
        .status(404)
        .json(new NotFoundError('getById', 'User not found').toJSON());
    }
    req.user = new UserResponseModel(user).getFullModelResponse();

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
  static async checkDuplicatesOnUpdate(
    req: Request,
    res: Response,
    next: Function,
  ): Promise<any> {
    const { body } = req;
    const propertiesToUpdate = Object.keys(body);
    const duplicates: Array<any> = await UserController._userDataAgent.pushDuplicatesToArray(
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
