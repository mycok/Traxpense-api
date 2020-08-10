import jwt, { Secret } from 'jsonwebtoken';

export function generateToken(_id: string, username: string, email: string) {
  return jwt.sign({ _id, username, email }, process.env.PRIVATE_KEY as Secret, {
    expiresIn: '1d',
  });
}
