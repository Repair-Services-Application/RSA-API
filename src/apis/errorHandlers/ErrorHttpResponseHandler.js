'use strict';

const ErrorHandler = require("./ErrorHandler");

class ErrorHttpResponseHandler extends ErrorHandler {
    constructor() {
        super('GeneralErrorHandler');
    }

    get path() {
        return '/';
    }

    registerHandler(application) {
        
    }
}

module.exports = ErrorHttpResponseHandler;