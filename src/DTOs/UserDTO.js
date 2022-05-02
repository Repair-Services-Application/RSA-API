'use strict';

const Validators = require('../utilities/Validators');

/**
 * A class conatians data about the logged in user, the data is the logged in usr's username, roleID, and errorCode
 */
class UserDTO {
    /**
     * Constructs a new instance of {UserDTO} object.
     * @param {string} username The loggedin username
     * @param {number} roleID The loggedin user roelID
     * @param {string} errorCode The error/status code (OK, Invalid, etc.)
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