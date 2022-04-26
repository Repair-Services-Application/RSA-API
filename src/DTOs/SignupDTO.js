'use strict';

const Validators = require("../utilities/Validators");

/**
 * 
 */
class SignupDTO {

    /**
     * 
     * @param {*} firstname 
     * @param {*} lastname 
     * @param {*} personalNumber 
     * @param {*} email 
     * @param {*} username 
     * @param {*} password 
     * @param {*} mobileNumber 
     */
    constructor(firstname, lastname, personalNumber, email, username, password, mobileNumber) {
        Validators.isAlphaString(firstname, 'First name');
        Validators.isAlphaString(lastname, 'Last name');
        Validators.isPersonalNumberFormat(personalNumber, 'Personal Number');
        Validators.isEmailFormat(email, 'Email');
        Validators.isAlphanumericString(username, 'Username');
        Validators.isValidMobileNumber(mobileNumber, 'MobileNumber');
        
        this.firstname = firstname;
        this.lastname = lastname;
        this.personalNumber = personalNumber;
        this.email = email;
        this.username = username;
        this.password = password;
        this.mobileNumber = mobileNumber;
    }
}

module.exports = SignupDTO;