'use strict';

const ReqHandler = require("./ReqHandler");

class ServiceApiHandler extends ReqHandler {
    constructor() {
        super();
    }

    get path() {
        return ServiceApiHandler.SERVICE_API_PATH;
    }

    static get SERVICE_API_PATH() {
        return '/service';
    }

    async registerHandler() {
        try {
            await this.fetchController();
        } catch (error) {
            
        }
    }
}

module.exports = ServiceApiHandler;