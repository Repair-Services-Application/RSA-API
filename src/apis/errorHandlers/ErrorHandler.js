'use strict';

const Logger = require("../../utilities/Logger");

/**
 * The superclass for other error handlers which are extend classes from this class.
 */
class ErrorHandler {

    /**
     * Constructs an instance of ErrorHandler class, and in the constructor, a Logger instance is being created as well.
     * @param {*} filename 
     */
    constructor(filename) {
        this.logger = new Logger(filename);
    }
}

module.exports = ErrorHandler;