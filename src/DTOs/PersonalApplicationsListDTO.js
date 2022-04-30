'use strict';

const Validators = require('../utilities/Validators');

class PersonalApplicationsListDTO{
    constructor(applications) {
        applications.forEach(currentApplication => {
            Validators.isPersonalApplication(currentApplication, 'Application');
        });
        this.applications = applications;
    }
}

module.exports = PersonalApplicationsListDTO;
