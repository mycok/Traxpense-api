import mongoose from 'mongoose';

import { logger } from '../../../utils/logger';

mongoose.Promise = global.Promise;

export class MongooseAccess {
  static mongooseInstance: any;

  static mongooseConnection: mongoose.Connection;

  static connect(mongoUri: string | undefined): mongoose.Connection {
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
    mongoose.set('autoIndex', true);

    if (this.mongooseInstance) {
      return this.mongooseInstance;
    }

    this.mongooseConnection = mongoose.connection;
    this.mongooseInstance = mongoose.connect(mongoUri as string);
    this.mongooseConnection.on('connected', () => {
      logger.info(`database connection running at: ${mongoUri}`);
    });
    this.mongooseConnection.on('error', (errMsg) => {
      logger.info(`database connection error: ${errMsg} `);
      process.exit();
    });

    this.mongooseConnection.on('disconnected', () => {
      logger.info('database connection disconnected!');
    });

    return this.mongooseInstance;
  }

  static async close() {
    await this.mongooseConnection.close(() => {
      logger.info('.....database connection closed.....');
    });
  }
}
