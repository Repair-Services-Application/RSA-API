'use strict';

const Controller = require('../controller/Controller');
const Validators = require('../utilities/Validators');
const Express = require('express');

/**
 * 
 */
class ReqHandler {
    /**
     * 
     * 
     */
    constructor() {
        this.reqRouter = Express.Router();
        //logger will be added here.
    }

    /**
     * The requests' url protocol.
     */
    static get REQUESTS_URL_PROTOCOL() {
        return 'http://';
    }

    /**
     * 
     */
    async fetchController() {
        this.controller = await Controller.createControllerInstance();
    }

    /**
     * 
     * @param {Response} response 
     * @param {number} responseStatusCode 
     * @param {any} responseBody 
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