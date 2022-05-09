import { JsonWebTokenError, verify, Secret } from 'jsonwebtoken';

function verifyToken(req: any, res: any, token: string, next: Function) {
  try {
    const payload = verify(token, process.env.PRIVATE_KEY as Secret);
    req.auth = payload;

    return next();
  } catch (err) {
    if (err instanceof JsonWebTokenError && err.message === 'invalid signature') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token signature',
      });
    }

    return res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'An error occurred!',
    });
  }
}

export function authenticate(req: any, res: any, next: Function) {
  const authorization = req.get('Authorization');
  if (authorization === undefined) {
    return res.status(401).json({
      success: false,
      message: 'The authorization header must be set',
    });
  }

  const [scheme, token]: string = authorization.split(' ');
  if (scheme !== 'Bearer') {
    return res.status(400).json({
      success: false,
      message: 'The authorization header should use the Bearer scheme',
    });
  }

  const jwtRegex = /^[\w-]+\.[\w-]+\.[\w-.+/=]*$/;
  if (!token || !jwtRegex.test(token)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid token',
    });
  }

  return verifyToken(req, res, token, next);
}

export function authorize(req: any, res: any, next: Function) {
  const { user, auth } = req;

  if (`${user._id}` !== auth._id) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to perform this action',
    });
  }

  return next();
}
