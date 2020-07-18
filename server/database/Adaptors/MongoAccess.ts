import mongoose from 'mongoose';

import { logger } from '../../../utils/logger';

mongoose.Promise = global.Promise;

export class MongooseAccess {
  static mongooseInstance: any;

  static mongoUri: string | undefined;

  static mongooseConnection: mongoose.Connection;

  static connect(): mongoose.Connection {
    this.mongoUri = process.env.NODE_ENV === 'test'
      ? process.env.TEST_MONGODB_URI
      : process.env.MONGODB_URI;

    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);

    if (this.mongooseInstance) {
      return this.mongooseInstance;
    }

    this.mongooseConnection = mongoose.connection;
    this.mongooseInstance = mongoose.connect(this.mongoUri as string);
    this.mongooseConnection.on('connected', () => {
      logger.info(`database connection running at: ${this.mongoUri}`);
    });
    this.mongooseConnection.on('error', (errMsg) => {
      logger.info(`database connection error: ${errMsg} `);
    });

    this.mongooseConnection.on('disconnected', () => {
      logger.info('database connection disconnected!');
    });

    process.on('SIGINT', async () => {
      await this.mongooseConnection.close(() => {
        logger.info(
          'database connection disconnected through app termination!',
        );
      });
    });

    return this.mongooseInstance;
  }

  static async close() {
    await this.mongooseConnection.close(() => {
      logger.info('.....database connection closed.....');
    });
  }
}
