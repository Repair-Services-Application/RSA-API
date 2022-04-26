'use strict';

const Validators = require('../utilities/Validators');

/**
 * 
 */
class UserDTO {
    /**
     * 
     * @param {*} username 
     * @param {*} roleID 
     * @param {*} errorCode 
     */
    constructor(username, roleID, errorCode) {
        Validators.isAlphanumericString(username, 'username');
        Validators.isIntegerBetween(roleID, 0, 3, 'roleID');
        this.username = username;
        this.roleID = roleID;
        this.errorCode = errorCode;
    }
}

module.exports  = UserDTO;