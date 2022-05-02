'use strict';

const Controller = require('../controller/Controller');
const Validators = require('../utilities/Validators');
const Express = require('express');
const Logger = require('../utilities/Logger');

/**
* Superclass of All Request handlers.
*/
class ReqHandler {
    
    /**
     * A construction creating a new instance of the Request handler, 
     * and declaring a new Logger with passed name for it. And defined the Express Router.
     */
    constructor() {
        this.reqRouter = Express.Router();
        this.logger = new Logger('ReqHandler');
    }

    /**
     * The requests' url protocol.
     */
    static get REQUESTS_URL_PROTOCOL() {
        return 'http://';
    }

    /**
     * Creates a new instance of the Controller (by calling the createControllerInstance()).
     */
    async fetchController() {
        this.controller = await Controller.createControllerInstance();
    }

    /**
     * Sends HTTP responses with specified response status and different body content.
     * @param {Response} response The Express response object.
     * @param {number} responseStatusCode  the response status code will be send along with the response
     * @param {any} responseBody the body contained in the Express response.
     * @returns 
     */
    sendHTTPResponse(response, responseStatusCode, responseBody) {
        Validators.isIntegerBetween(responseStatusCode, 200, 503, 'The status code');

        if (responseBody === undefined) {
            response.status(responseStatusCode).end();
            return;
        }
        let jsonStatusCode = undefined;
        if(responseStatusCode >= 400) {
            jsonStatusCode = 'error';
        }
        else {
            jsonStatusCode = 'success';
        }

        response.status(responseStatusCode).json({[jsonStatusCode]: responseBody});
    }

}

module.exports = ReqHandler;