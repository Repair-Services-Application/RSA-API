'use strict';

const Validators = require('../utilities/Validators');

class ApplicationsFilteredListDTO{
    constructor(applications) {
        applications.forEach(currentApplication => {
            Validators.isApplication(currentApplication, 'Application');
        });
        this.applications = applications;
    }
}

module.exports = ApplicationsFilteredListDTO;