import { ExpressMiddlewareInterface } from 'routing-controllers';

export class RouteMiddleware implements ExpressMiddlewareInterface {
  use(request: any, response: any, next: (err?: any) => any) {
    next();
  }
}
