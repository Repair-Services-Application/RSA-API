'use strict';

const Validators = require('../utilities/Validators');

/**
 * The filtered applications list by worker. A validation occurs to check if each application in the list is a valid application.
 */
class ApplicationsFilteredListDTO{

    /**
     * constructs an instance of the {ApplicationsFilteredListDTO} object. 
     * @param {applicationList[]} applications the filtered application which gonna be checked.
     */
    constructor(applications) {
        applications.forEach(currentApplication => {
            Validators.isApplication(currentApplication, 'Application');
        });
        this.applications = applications;
    }
}

module.exports = ApplicationsFilteredListDTO;