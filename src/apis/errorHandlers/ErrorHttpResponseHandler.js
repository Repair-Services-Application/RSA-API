'use strict';

const ErrorHandler = require("./ErrorHandler");

/**
 * An extend class of ErrorHandler, but this is GeneralErrorHandler esapacially for internal server errros.
 */
class ErrorHttpResponseHandler extends ErrorHandler {
    /**
     * A constructor to create a new instance of ErrorHttpResponseHandler, and passing the log filename. 
     */
    constructor() {
        super('GeneralErrorHandler');
    }

    /**
     *  @return {string} the URL path that will be handled by the ErrorHHandler
     */
    get path() {
        return '/';
    }

    /**
     * It register new error handler for the specified URL path declared in the function (path())
     * @param {Application} app The express application that will be hosting the error handlers.
     */
    registerHandler(app) {
        app.use(this.path, (error, request, response, next) => {
            this.logger.logCurrentException(error);
            if(response.headersSent) {
                return next(error);
            }

            response.status(500).send({error: 'An internal unexpected error has encountered by the server.'});
        });
    }
}

module.exports = ErrorHttpResponseHandler;