'use strict';

const ErrorHandler = require("./ErrorHandler");

/**
* An extend class of ErrorHandler, but this is ErrorUserHandler esapacially for user's Api endpoints (UserApiHandler).
*/
class ErrorUserHandler extends ErrorHandler {

    /**
    * A constructor to create a new instance of ErrorUserHandler, and passing the log filename. 
    */
    constructor() {
        super('UserApiHandler');
    }

    /**
    *  @return {string} the URL path that will be handled by the ErrorHHandler
    */
    get path() {
        return '/user/';
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

            response.status(503).send({error: "The user's service (authentication / authorization) is unavailable"})
        })
    }
}

module.exports = ErrorUserHandler;