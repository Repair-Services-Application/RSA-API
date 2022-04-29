'use strict';

const Validators = require('../utilities/Validators');

class ApplicationsFilterParamsDTO{
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