'use strict';

const ReqHandler = require("./ReqHandler");

class UserApiHandler extends ReqHandler {
    constructor() {
        super();
    }

    get path() {
        return UserApiHandler.USER_API_PATH;
    }

    static get USER_API_PATH() {
        return '/user';
    }

    async registerHandler() {
        try {
            await this.fetchController();
        } catch (error) {
            
        }
    }
}

module.exports = UserApiHandler;