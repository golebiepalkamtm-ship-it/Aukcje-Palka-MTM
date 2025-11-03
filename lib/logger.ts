export const isDev = process.env.NODE_ENV !== 'production';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let debug = (..._args: any[]) => {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let info = (..._args: any[]) => {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let error = (..._args: any[]) => {};

if (typeof window === 'undefined') {
  const winston = require('winston');
  const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      }),
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug = (...args: any[]) => isDev && logger.debug && logger.debug(...args);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info = (...args: any[]) => logger.info && logger.info(...args);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error = (...args: any[]) => logger.error && logger.error(...args);
}

export { debug, info, error };
