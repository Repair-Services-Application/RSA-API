'use strict';

const ErrorHandler = require("./ErrorHandler");

class ErrorServiceHandler extends ErrorHandler {
    constructor() {
        super('ServiceApiHandler');
    }

    get path() {
        return '/service/';
    }

    registerHandler(application) {
        
    }
}

module.exports = ErrorServiceHandler;