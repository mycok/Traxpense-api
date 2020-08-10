import jwt, { Secret } from 'jsonwebtoken';

export function generateToken(id: string, username: string, email: string) {
  return jwt.sign({ id, username, email }, process.env.PRIVATE_KEY as Secret, {
    expiresIn: '1d',
  });
}
