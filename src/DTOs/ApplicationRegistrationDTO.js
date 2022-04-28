'use strict';

const Validators = require('../utilities/Validators');

class ApplicationRegistrationDTO{
    constructor(applicationID, errorCode) {
        Validators.isNonNegativeNumber(applicationID, 'Application Id');

        this.applicationID = applicationID;
        this.errorCode = errorCode;
    }
}

module.exports = ApplicationRegistrationDTO;