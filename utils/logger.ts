import * as winston from 'winston';

const { transports, format, createLogger } = winston;
const { combine, prettyPrint, timestamp } = format;

const customTransports = [
  new transports.File({
    filename: 'error.log',
    level: 'error',
  }),
  new transports.File({
    filename: 'combined.log',
    level: 'verbose',
  }),
];

export const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), prettyPrint()),
  transports: customTransports,
  exceptionHandlers: [
    new transports.File({
      filename: 'exceptions.log',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      handleExceptions: true,
      level: 'verbose',
    }),
  );
}

process.on('unhandledRejection', (reason, p) => {
  logger.warn(
    ` A system level exception occured, Possibly unhandled rejection at: Promise ${p}, reason: ${reason}`,
  );
});
