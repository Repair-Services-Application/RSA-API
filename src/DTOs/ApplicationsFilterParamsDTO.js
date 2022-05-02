'use strict';

const Validators = require('../utilities/Validators');

/**
 * A class of the filtering parameters. The parameters are checked and validated before being saved as an object. 
 */
class ApplicationsFilterParamsDTO{

    /**
     * Constructs an instance of the {ApplicationsFilterParamsDTO} object.
     * @param {number} applicationId The specified application's id
     * @param {string} categoryId The specified category's id.
     * @param {string} firstname The specified user's firstname.
     * @param {string} lastname The specified user's lastname.
     * @param {string} dateOfRegistrationFrom The specified date of registration range starts from
     * @param {string} dateOfRegistrationTo  The specified date of registration range ends to.
     * @param {number} suggestedPriceFrom The worker's suggested price range starts from for the applications
     * @param {number} suggestedPriceTo The worker's suggested price range ends to for the applications
     * @param {number} reparationStatusId The id of the reparation's status.
     */
    constructor(applicationId, categoryId, firstname, lastname, dateOfRegistrationFrom, dateOfRegistrationTo, 
        suggestedPriceFrom, suggestedPriceTo, reparationStatusId) {

            Validators.isNonNegativeWholeNumber(applicationId, 'Application Id');
            Validators.isNonNegativeWholeNumber(categoryId, 'Category Id');
            Validators.isAlphaString(firstname, 'First name');
            Validators.isAlphaString(lastname, 'Last name');
            Validators.isDateFormat(dateOfRegistrationFrom, 'Date of registration from');
            Validators.isDateFormat(dateOfRegistrationTo, 'Date of registration to');
            Validators.isNonNegativeNumber(suggestedPriceFrom, 'Suggested price from');
            Validators.isNonNegativeNumber(suggestedPriceTo, 'Suggested price To');
            Validators.isNonNegativeWholeNumber(reparationStatusId, 'Reparation Status Id');
            
            this.applicationId = applicationId;
            this.categoryId = categoryId;
            this.firstname = firstname;
            this.lastname = lastname;
            this.dateOfRegistrationFrom = dateOfRegistrationFrom;
            this.dateOfRegistrationTo = dateOfRegistrationTo;
            this.suggestedPriceFrom = suggestedPriceFrom;
            this.suggestedPriceTo = suggestedPriceTo;
            this.reparationStatusId = reparationStatusId;
        }
}

module.exports = ApplicationsFilterParamsDTO;