'use strict';

const Validators = require('../utilities/Validators');

class ReparationStatusDTO {
    constructor(reparationStatusId, reparationStatusDescription) {
        Validators.isNonNegativeNumber(reparationStatusId, 'Reparation Status ID');
        Validators.isAlphaString(reparationStatusDescription, 'Reparation Status Description');

        this.reparationStatusId = reparationStatusId;
        this.reparationStatusDescription = reparationStatusDescription;
    }
}

module.exports = ReparationStatusDTO;