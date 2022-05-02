'use strict';

const ErrorHandler = require("./ErrorHandler");


/**
* An extended class of ErrorHandler, but this is ErrorServiceHandler esapacially for service (ServiceApiHandler).
*/
class ErrorServiceHandler extends ErrorHandler {
    /**
    * A constructor to create a new instance of ErrorServiceHandler, and passing the log filename. 
    */
    constructor() {
        super('ServiceApiHandler');
    }

    /**
    *  @return {string} the URL path that will be handled by the ErrorHHandler
    */
    get path() {
        return '/service/';
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

            response.status(503).send({error: "The application's service is unavailable"});
        });
    }
}

module.exports = ErrorServiceHandler;