import { logger } from '../../utils/logger';
import { Application } from './Application';

export class Server {
  server: any;

  application: Application;

  constructor() {
    this.application = new Application();
    this.server = this.application.app.listen(process.env.PORT, () => logger.info(
      `
      -----------------------------------------------
      Server Started! Express: http://localhost:${process.env.PORT}
      -----------------------------------------------
      `,
    ));
  }
}
