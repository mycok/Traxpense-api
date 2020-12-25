import { logger } from '../../utils/logger';
import { Application } from './Application';
import { MongooseAccess } from '../database/adaptors/MongoAccess';

export class Server {
  private readonly application: Application;

  constructor() {
    MongooseAccess.connect(process.env.MONGODB_URI);

    this.application = new Application();
    this.application.app.listen(process.env.PORT, () => logger.info(
      `
      -----------------------------------------------
      Server Started! Express: http://localhost:${process.env.PORT}
      -----------------------------------------------
      `,
    ));
  }
}
