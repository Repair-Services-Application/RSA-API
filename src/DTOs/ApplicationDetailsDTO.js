'use strict';

const Validators = require('../utilities/Validators');

/**
 * 
 */
class ApplicationDetailsDTO{

    /**
     * 
     * @param {*} applicationDetailsDTO 
     */
    constructor(applicationDetailsDTO) {
        //console.log(applicationDetailsDTO);
        Validators.isNonNegativeNumber(applicationDetailsDTO.applicationId, 'Application ID');
        Validators.isAlphaString(applicationDetailsDTO.firstName, 'First name');
        Validators.isAlphaString(applicationDetailsDTO.lastName, 'Last name');
        Validators.isAlphaString(applicationDetailsDTO.categoryDescription, 'Category description');
        Validators.isNonNegativeNumber(applicationDetailsDTO.categoryId, 'Category Id');
        Validators.isNotEmpty(applicationDetailsDTO.problemDescription, 'Problem description');
        Validators.isDateFormat(applicationDetailsDTO.dateOfRegistration, 'Date of registration');
        Validators.isTimeFormat(applicationDetailsDTO.timeOfRegistration, 'Time of registration');
        Validators.isNonNegativeNumber(applicationDetailsDTO.suggestedPriceByWorker, 'Suggested prive by worker');
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