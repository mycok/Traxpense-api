import { Request, Response } from 'express';

import userSchema from '../../validation/schemas/user/create.json';
import profileSchema from '../../validation/schemas/user/profile.json';
import updateSchema from '../../validation/schemas/user/update.json';
import { UserDataAgent } from '../../database/data-agents/user/UserDataAgent';
import { UserResponseModel } from '../../database/data-abstracts/user/UserResposeModel';
import { UserModel } from '../../database/data-abstracts/user/UserModel';
import { Validator } from '../../validation/validators';
import { BadRequestError } from '../../extensions/BadRequestError';
import { NotFoundError } from '../../extensions/NotFoundError';
import { IUserDocument } from '../../database/data-abstracts/user/IUserDocument';

interface IUserRequest {
  id: string;
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

interface IUserResponse {
  id: string;
  username: string;
  email: string;
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
  private static userDataAgent = new UserDataAgent();

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

    const result = await UserController.userDataAgent.create(body);

    if (typeof result !== 'string') {
      return res.status(201).json({
        success: true,
        user: <IUserResponse>{
          ...new UserResponseModel(result as IUserDocument).getResponseModel(),
        },
      });
    }
    return res
      .status(400)
      .json(new BadRequestError('create', result as string).toJSON());
  }

  static async list(req: Request, res: Response): Promise<any> {
    const users: IUserDocument[] = await UserController.userDataAgent.list();

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.length > 0 ? <IUserResponse[]>users : users,
    });
  }

  static async read(req: any, res: Response): Promise<any> {
    const { user } = req;

    return res.status(200).json({
      success: true,
      user: <IUserResponse>user,
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

    const updatedUser = await UserController.userDataAgent.update(_id, body);

    if (typeof updatedUser !== 'object') {
      return res.status(400).json(new BadRequestError('update', updatedUser));
    }

    return res.status(200).json({
      success: true,
      user: <IUserResponse>updatedUser,
    });
  }

  static async delete(req: any, res: Response): Promise<any> {
    const {
      user: { _id },
    } = req;

    const deletedResponse = await UserController.userDataAgent.delete(_id);

    if (typeof deletedResponse !== 'string') {
      return res.status(200).json({
        success: true,
        deletedResponse,
      });
    }
    return res.status(400).json(new BadRequestError('delete', deletedResponse));
  }

  // helpers and middleware
  static async getById(
    req: any,
    res: Response,
    next: Function,
    userId: string,
  ): Promise<any> {
    const user = await UserController.userDataAgent.getById(userId);

    if (!user) {
      return res
        .status(404)
        .json(new NotFoundError('getById', 'User Not Found').toJSON());
    }
    req.user = user;

    return next();
  }

  private static async pushDuplicatesToArray(
    items: Array<any>,
    obj: any,
  ): Promise<any> {
    const arr: Array<any> = [];
    for (const item of items) {
      if (item === 'username' || item === 'email') {
        const user = await UserModel.findOne({ [item]: obj[item] });
        if (user) arr.push({ [item]: `${obj[item]} already exists` });
      }
    }
    return arr;
  }

  static async checkDuplicatesOnUpdate(
    req: Request,
    res: Response,
    next: Function,
  ): Promise<any> {
    const { body } = req;
    const propertiesToUpdate = Object.keys(body);
    const duplicates: Array<any> = await UserController.pushDuplicatesToArray(
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
