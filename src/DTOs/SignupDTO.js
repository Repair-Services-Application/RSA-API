'use strict';

const Validators = require("../utilities/Validators");

/**
 * A class contains data about the new signuped user. 
 */
class SignupDTO {

    /**
     * Constructs a new instance of {SignupDTO} object using the passed parameters. 
     * @param {string} firstname The new user's firstname
     * @param {string} lastname  The new user's lastname
     * @param {string} personalNumber  The new user's personalNumber
     * @param {string} email  The new user's email adress
     * @param {string} username  The new user's username which will be used for the login process.
     * @param {string} password  The new user's password which will be used for the login process.
     * @param {string} mobileNumber  The new user's mobile number.
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