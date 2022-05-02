'use strict';

const {createLogger, format, transports} = require('winston');

/**
 * Writes and save the occured errors in log files under the package errorLogs using the winston package.
 */
class Logger {

    /**
     * Constructs a new instance of {Logger} object using winstonLogger with specific options.
     * @param {string} filename the name of the file that will contains the occured error inside the package 'errorLogs'.
     */
    constructor(filename) {
        this.winstonLogger = createLogger({
            level: 'error',
            format: format.combine(
                format.errors({stack: true}),
                format.prettyPrint(),
                format.timestamp(),
            ),
            transports: [
                new (transports.File)({filename: `errorLogs/${filename}.log`}),
                new transports.Console(),
            ],
        });
    }

    /**
     * Save the exception in the logfile.
     * @param {Exception} exception the error exception to be logged.
     */
    logCurrentException(exception) {
        this.winstonLogger.log({level: 'error', exception});
    }
}

module.exports = Logger;