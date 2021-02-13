import { Request, Response } from 'express';
import authSchema from '../../validation/schemas/user/auth.json';
import { BadRequestError } from '../../extensions/BadRequestError';
import { NotFoundError } from '../../extensions/NotFoundError';
import { IUserDocument } from '../../database/data-abstracts/user/IUserDocument';
import { UserModel } from '../../database/data-abstracts/user/UserModel';
import { doPasswordsMatch } from '../../../utils/passwordUtils';
import { generateToken } from '../../../utils/authUtils';
import { UserModelResponse } from '../../database/data-abstracts/user/UserModelResponse';
import { handleErrorMessages } from '../../../utils/dbErrorHandler';
import { AuthValidator } from '../../validation/validators/auth/index';

interface ISigninRequest {
  email: string;
  password: string;
}

export class AuthController {
  static async signin(req: Request, res: Response): Promise<any> {
    const { body } = req;
    const validationResults = new AuthValidator().validate<ISigninRequest>(
      authSchema,
      'signin',
      body,
    );

    if (typeof validationResults === 'string') {
      return res.status(400).json(new BadRequestError('sign-in', validationResults));
    }

    const user: any = await UserModel.findOne({
      email: body.email,
    }).catch((err) => res.status(400).json(new BadRequestError('sign-in', handleErrorMessages(err))));

    if (!user) {
      return res.status(404).json(new NotFoundError('sign-in', 'Email not found'));
    }

    if (!doPasswordsMatch(body.password, user.password, user.salt)) {
      return res
        .status(400)
        .json(new BadRequestError('sign-in', "Passwords don't match"));
    }

    const token = generateToken(user._id, user.username, user.email);

    return res.status(200).json({
      success: true,
      user: {
        ...new UserModelResponse(user as IUserDocument).getResponseModel(),
      },
      token,
    });
  }
}
