'use strict';

const ServiceApiHandler = require('./ServiceApiHandler');
const UserApiHandler = require('./UserApiHandler');
const ErrorServiceHandler = require('./errorHandlers/ErrorServiceHandler');
const ErrorHttpResponseHandler = require('./errorHandlers/ErrorHttpResponseHandler');
const ErrorUserHandler = require('./errorHandlers/ErrorUserHandler');

/**
 * Loads all requests and errors handlers to lists
 */
class RequestHandlerLoader {

    /**
     * The construction of the new instance of {RequestHandlerLoader}
     */
    constructor() {
        this.reqHandlersList = [];
        this.errorHandlersList = [];
    }

    /**
     * Add the new request handler to the list
     * @param {ReqHandler} requestHandler the passed request handler that will be added to the pre-defined list.
     */
    addRequestHandlerToList(requestHandler) {
        this.reqHandlersList.push(requestHandler);
    }

    /**
     * Add the new Error handler to the list
     * @param {ErrorHandler} errorHandler the passed error handler that will be added to the pre-defined list.
     */
    addErrorHandlerToList(errorHandler) {
        this.errorHandlersList.push(errorHandler);
    }

    /**
     * Load all the registered Request handlers from the list into the passed express application
     * @param {Application} application the express application that will be hosting the requests handlers from the {reqHandlersList}
     */
    loadAllRequestsHandlers(application) {
        console.log('Loading the registered handlers.');
        this.reqHandlersList.forEach(reqHandler => {
            reqHandler.registerHandler();
            application.use(reqHandler.path, reqHandler.reqRouter);
        });
    }

    /**
     * Load all the registered Error handlers from the list into the passed express  application.
     * @param {Application} application The express application that will be hosting the errors handlers from the {errorHandlersList}
     */
    loadAllErrorsHandlers(application) {
        this.errorHandlersList.forEach((currentErrorHandler) => {
            currentErrorHandler.registerHandler(application);
        });
    }


}

const requestHandlerLoader = new RequestHandlerLoader();
const userApiHandler = new UserApiHandler();
const serviceApiHandler = new ServiceApiHandler();
const errorHttpResponseHandler = new ErrorHttpResponseHandler();
const errorServiceHandler = new ErrorServiceHandler();
const errorUserHandler = new ErrorUserHandler();

requestHandlerLoader.addRequestHandlerToList(userApiHandler);
requestHandlerLoader.addRequestHandlerToList(serviceApiHandler);
requestHandlerLoader.addErrorHandlerToList(errorHttpResponseHandler);
requestHandlerLoader.addErrorHandlerToList(errorServiceHandler);
requestHandlerLoader.addErrorHandlerToList(errorUserHandler);


module.exports = requestHandlerLoader;