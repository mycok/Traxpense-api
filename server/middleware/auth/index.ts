import { JsonWebTokenError, verify, Secret } from 'jsonwebtoken';

function verifyToken(req: any, res: any, token: string, next: Function) {
  try {
    const payload = verify(token, process.env.PRIVATE_KEY as Secret);
    req.auth = payload;

    return next();
  } catch (err) {
    if (
      err instanceof JsonWebTokenError
      && err.message === 'invalid signature'
    ) {
      return res.status(400).json({ message: 'Invalid token signature' });
    }
    return res.status(500).json({ message: err.message });
  }
}

export function authenticate(req: any, res: any, next: Function) {
  const authorization = req.get('Authorization');
  if (authorization === undefined) {
    return res
      .status(401)
      .json({ message: 'The authorization header must be set' });
  }

  const [scheme, token]: string = authorization.split(' ');
  if (scheme !== 'Bearer') {
    return res.status(400).json({
      message: 'The authorization header should use the Bearer scheme',
    });
  }

  const jwtRegex = /^[\w-]+\.[\w-]+\.[\w-.+/=]*$/;
  if (!token || !jwtRegex.test(token)) {
    return res.status(400).json({
      message:
        'The credentials used in the Authorization header should be a valid bcrypt digest',
    });
  }

  return verifyToken(req, res, token, next);
}
