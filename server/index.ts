import 'reflect-metadata';
import { Server } from './app/Server';
import { MongooseAccess } from './database/Adaptors/MongoAccess';

MongooseAccess.connect();

export default new Server();
