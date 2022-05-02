'use strict';

const Validators = require('../utilities/Validators');

/**
 * A class that will contain The application details when a user, worker or administartor will try to show a specific application's details
 */
class ApplicationDetailsDTO{

    /**
     * constructs an insatance of the {ApplicationDetailsDTO} object.
     * @param {ApplicationDetailsDTO} applicationDetailsDTO An object has the same content as this class. It is used to modify 
     * the data in the {RepairmentServiceDAO} object before passing it to this class according to the returned data.
     * All validations are done here before declaring the class's variables. 
     */
    constructor(applicationDetailsDTO) {
        Validators.isNonNegativeNumber(applicationDetailsDTO.applicationId, 'Application ID');
        Validators.isAlphaString(applicationDetailsDTO.firstName, 'First name');
        Validators.isAlphaString(applicationDetailsDTO.lastName, 'Last name');
        Validators.isAlphaString(applicationDetailsDTO.categoryDescription, 'Category description');
        Validators.isNonNegativeNumber(applicationDetailsDTO.categoryId, 'Category Id');
        Validators.isNotEmpty(applicationDetailsDTO.problemDescription, 'Problem description');
        Validators.isDateFormat(applicationDetailsDTO.dateOfRegistration, 'Date of registration');
        Validators.isTimeFormat(applicationDetailsDTO.timeOfRegistration, 'Time of registration');
        Validators.isNonNegativeNumber(applicationDetailsDTO.suggestedPriceByWorker, 'Suggested price by worker');
        Validators.isBooleanOrNull(applicationDetailsDTO.priceApprovalByUser, 'Price approval by user');
        Validators.isNonNegativeNumber(applicationDetailsDTO.reparationStatusId, 'Reparation status Id');
        Validators.isAlphaString(applicationDetailsDTO.reparationStatusDescription, 'Reparation status description');

        
        this.applicationId = applicationDetailsDTO.applicationId;
        this.firstname = applicationDetailsDTO.firstName;
        this.lastname = applicationDetailsDTO.lastName;
        this.categoryDescription = applicationDetailsDTO.categoryDescription;
        this.categoryId = applicationDetailsDTO.categoryId;
        this.problemDescription = applicationDetailsDTO.problemDescription;
        this.dateOfRegistration = applicationDetailsDTO.dateOfRegistration;
        this.timeOfRegistration = applicationDetailsDTO.timeOfRegistration;
        this.suggestedPriceByWorker = applicationDetailsDTO.suggestedPriceByWorker;
        this.priceApprovalByUser = applicationDetailsDTO.priceApprovalByUser;
        this.reparationStatusId = applicationDetailsDTO.reparationStatusId;
        this.reparationStatusDescription = applicationDetailsDTO.reparationStatusDescription;
        this.errorCode = applicationDetailsDTO.errorCode;
    } 
}

module.exports = ApplicationDetailsDTO;