'use strict';

const Validators = require('../utilities/Validators');

class ApplicationsFilteredListDTO{
    constructor(applications) {
        applications.forEach(currentApplication => {
            //console.log(currentApplication);
            Validators.isApplication(currentApplication, 'Application');
        });
        this.applications = applications;
    }
}

module.exports = ApplicationsFilteredListDTO;