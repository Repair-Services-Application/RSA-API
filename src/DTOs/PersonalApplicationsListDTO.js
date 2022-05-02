'use strict';

const Validators = require('../utilities/Validators');

/**
 * A class contains the logged in user's personal applications list. 
 */
class PersonalApplicationsListDTO{

    /**
     * Constructs a new instance of {PersonalApplicationsListDTO} object using the passed applications
     * @param {object[]} applications contains data about the personal applications
     */
    constructor(applications) {
        applications.forEach(currentApplication => {
            Validators.isPersonalApplication(currentApplication, 'Application');
        });
        this.applications = applications;
    }
}

module.exports = PersonalApplicationsListDTO;
