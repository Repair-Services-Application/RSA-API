'use strict';

const Validators = require('../utilities/Validators');

/**
 * A class that will contain the data return when an Application is registered by the user to the database.
 */
class ApplicationRegistrationDTO{

    /**
     * constructs an instance of the {ApplicationRegistrationDTO} object using the passed data.
     * @param {number} applicationID The new registered application's id.
     * @param {string} errorCode The status of registering the application, it can one of the staus in the file "applicationRegistrationErrorEnum.js" under the package "utilities".
     */
    constructor(applicationID, errorCode) {
        Validators.isNonNegativeNumber(applicationID, 'Application Id');

        this.applicationID = applicationID;
        this.errorCode = errorCode;
    }
}

module.exports = ApplicationRegistrationDTO;