'use strict';

const ErrorHandler = require("./ErrorHandler");

class ErrorUserHandler extends ErrorHandler {
    constructor() {
        super('UserApiHandler');
    }

    get path() {
        return '/user/';
    }

    registerHandler(application) {
       
    }
}

module.exports = ErrorUserHandler;