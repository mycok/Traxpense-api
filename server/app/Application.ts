import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { userRouter } from '../routers/UserRouter';

export class Application {
  app: express.Express;

  constructor() {
    this.app = express();
    this.middlewareSetup();
    this.RouterSetup();
  }

  private middlewareSetup() {
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(helmet());
    this.app.use(this.clientErrorHandler);
    this.app.use('/dist', express.static(path.join(process.cwd(), 'dist')));
  }

  private RouterSetup() {
    this.app.use(userRouter);
  }

  private clientErrorHandler(
    err: any,
    req: express.Request,
    res: express.Response,
    next: Function,
  ) {
    if (err.thrown) {
      res.status(err.status).send({ error: err.message });
    }

    next();
  }
}
