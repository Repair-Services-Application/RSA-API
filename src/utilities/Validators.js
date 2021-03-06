'use strict';

const assert = require('assert').strict;
const validator = require('validator');
const personalNumber = require('swedish-personal-identity-number-validator');
const phoneValidator = require('phone');

/**
 * A class with validation methods. This class contains validation methods
 * that are specifically tailored to suit the needs of other classes
 * in the project.
 */
class Validators {
    /**
     * Checks that the provided value is an integer that bigger or equal to lowerLimit,
     * and is smaller or equal to upperLimit.
     *
     * @param {any} value The value to be validated.
     * @param {number} lowerLimit The lower allowed limit, inclusive.
     * @param {number} upperLimit The upper allowed limit, inclusive.
     * @param {string} varName The variable name to be included in the assertion error message
     *                         in case that the validation fails.
     * @throws {AssertionError} If validation fails.
     */
    static isIntegerBetween(value, lowerLimit, upperLimit, varName) {
        const result = validator.isInt(value.toString(), {min: lowerLimit, max: upperLimit});

        assert(
            result,
            `${varName} is not an integer between ${lowerLimit} and ${upperLimit}.`,
        );
    }

    /**
     * Checks that the passed value is an alphanumeric string.
     *
     * @param {any} value The passed value to be validated.
     * @param {string} varName The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isAlphanumericString(value, varName) {
        const result = validator.isAlphanumeric(value.toString());
        assert(
            result,
            `${varName} must only includes letters and numbers.`,
        );
    }

    /**
     * Checks if the specified values includes only letters (no other numbers, symbols, etc).
     * @param {any} value The value to be validated.
     * @param {String} varName The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isAlphaString(value, varName) {
        const result = validator.isAlpha(value.toString(), ['sv-SE'], {ignore: '\' '}) ;
        assert(
            result,
            `${varName} must only includes letters.`,
        );
    }

    /**
     * Checks if the email formation is correct, valid email example (cc.cc@cc.cc).
     * @param {any} value The value to be validated.
     * @param {String} varName The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isEmailFormat(value, varName) {
        const result = validator.isEmail(value.toString());
        assert(
            result,
            `${varName} has a wrong formation, example (cc.cc@cc.cc).`,
        );
    }

    /**
     * 
     * @param {*} value 
     * @param {*} varName 
     */
    static isBooleanOrNull(value, varName) {
        let result = false;
        const valueString = value.toString();

        if(valueString === 'True' || 
        valueString === 'true' || 
        valueString === 'False' || 
        valueString === 'false' || 
        valueString === 'Undefined') {
            result = true;
        }

        assert(
            result,
            `${varName} should be either True/true, False/false or Undefined.`,
        );

    }
    /**
     * Checks if the formation of the personal number for the person is correct,
     * valid personal number example (YYYYMMDD-XXXX), 13 characters to be specific as it is saved in the db, 
     * no extra character / number / symbols.
     * The personal number will be also checked if it is valid using a library.
     * @param {any} value The value to be validated.
     * @param {String} varName  The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isPersonalNumberFormat(value, varName) {
        const result = this.isPersonalNumber(value);
        assert(
            result,
            `${varName} should be formatted correctly, example (YYYYMMDD-XXXX).`,
        );
    }

    /**
     * Checks if the personal number for the person is formatted correctly,
     * valid personal number example (YYYYMMDD-XXXX), 13 characters to be specific.
     * The personal number will be also checked if it is valid.
     * @param {any} value The value to be validated.
     * @return {boolean} indicates whether the personal number is valid or not.
     */
    static isPersonalNumber(value) {
        let result = validator.matches(value.toString(),
            '^[0-9]{8}-[0-9]{4}$');
        if (result === true) {
            result = personalNumber.isValid(value.toString());
        }

        return result;
    }

    /**
     * Check if the value is a number that is whole no decimals, and is bigger than zero (positive number).
     * @param {any} value The value to be validated.
     * @param {String} varName  The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isPositiveWholeNumber(value, varName) {
        const result = validator.isInt(value.toString(), {min: 1});
        assert(
            result,
            `${varName} should be a positive whole number.`,
        );
    }

    /**
     * Check if the description is actually a text with only spaces present.
     * @param {any} value The value to be validated.
     * @param {String} varName  The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isDescriptionString(value, varName) {
        const result = validator.isAlpha(value.toString(), ['sv-SE'], {ignore: ' .,'});
        assert(
            result,
            `${varName} must consist of letters that could be separated by spaces.`,
        );
    }

    /**
     * Check if the value is a valid category, Category is an object {id, type, parentCategoryId}
     * @param {any} value The value to be validated.
     * @param {String} varName  The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isCategory(value, varName) {
        let result = validator.isInt(value.category_id.toString(), {min: 1});

        assert(
            result,
            `${varName} ID should be a positive whole number.`,
        );

        result = validator.isAlpha(value.description.toString(), ['sv-SE'], {ignore: ' '});

        assert(
            result,
            `${varName} type should consist of letters that could be separated by spaces.`,
        );

        result = validator.isInt(value.parent_category_id.toString(), {min: 0});

        assert(
            result,
            `${varName} ID should be higher than Zero.`,
        );
    }

    /**
     * Checks if the Date is formatted correctly, valid date example (YYYY-MM-DD).
     * The date will be also validated if it is actual.
     * @param {any} value The value to be validated.
     * @param {String} varName  The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isDateTimeFormat(value, varName) {
        const result = validator.isDate(value.toString(), {
            format: 'YYYY-MM-DD HH:MM:SS', 
            strictMode: true,
            delimiters: ['-', ' ', ":"],
        });

        
        assert(
            result,
            `${varName} should be formatted correctly, example (YYYY-MM-DD HH:MM:SS).`,
        );
    }

    /**
     * 
     * @param {*} value 
     * @param {*} varName 
     */
    static isDateFormat(value, varName) {
        const result = validator.isDate(value.toString(), {
            format: 'YYYY-MM-DD', 
            strictMode: true,
            delimiters: ['-', ' ', ":"],
        });
        assert(
            result,
            `${varName} should be formatted correctly, example (YYYY-MM-DD).`,
        );
    }

    static isTimeFormat(value, varName) {
        const result = validator.matches(value.toString(),
        '^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$');

        assert(
            result,
            `${varName} should be formatted correctly, example (HH:MM:SS).`,
        );
    }

    /**
     * Check if the value is a non negative number (less than zero) that could be a zero .
     * @param {any} value The value to be validated.
     * @param {String} varName  The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isNonNegativeNumber(value, varName) {
        let result = false;

        if (value >= 0) {
            result = true;
        }


        assert(
            result,
            `${varName} should be a non negative number.`,
        );
    }

    /**
     * 
     * @param {*} value 
     * @param {*} varName 
     */
    static isValidMobileNumber(value, varName) {
        
        let result = false;
        const validation = phoneValidator.phone(value, {validateMobilePrefix: false, country: 'SWE'});
        if(validation.isValid === true) {
            result = true;
        }

        assert(
            result,
            `${varName} The phone number is not a valid swedish mobile number.`,
        );
    }

    /**
     * Check if the value is not negative (less than zero), zero in considered as a positive number.
     * @param {any} value The value to be validated.
     * @param {String} varName  The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isNonNegativeWholeNumber(value, varName) {
        const result = validator.isInt(value.toString(), {min: 0});

        assert(
            result,
            `${varName} number should be a non-negative whole number.`,
        );
    }

    /**
     * 
     * @param {*} value 
     * @param {*} varName 
     */
    static isNotEmpty(value, varName) {

        let result = false;
        if(value !== '') {
            result = true;
        }

        assert(
            result,
            `${varName} cannot be empty.`,
        );
    }

    /**
     * Check if the value is an application object {id, firstName, lastName, categoryDescription, statusDescription}.
     * @param {any} value The value to be validated.
     * @param {String} varName  The passed variable name to be asserted along in the assertion error message
     *                         in case that the validation doesn't success.
     * @throws {AssertionError} If validation fails.
     */
    static isApplication(value, varName) {
        let result = validator.isInt(value.applicationId.toString(), {min: 1});

        assert(
            result,
            `${varName} ID should be a positive whole number bigger than zero.`,
        );

        result = validator.isAlpha(value.firstName.toString(), ['sv-SE'], {ignore: '\''});
        
        assert(
            result,
            `${varName} first name should consist only of letters.`,
        );

        result = validator.isAlpha(value.lastName.toString(), ['sv-SE'], {ignore: '\''});

        assert(
            result,
            `${varName} last name should consist only of letters.`,
        );

        result = this.isDateFormat(value.dateOfRegistration, 'Date of registration');

        result = this.isTimeFormat(value.timeOfRegistration, 'Time of registration');
    }


    /**
     * 
     * @param {*} value 
     * @param {*} varName 
     */
    static isPersonalApplication(value, varName) {
        let result = validator.isInt(value.applicationId.toString(), {min: 1});

        assert(
            result,
            `${varName} ID should be a positive whole number bigger than zero.`,
        );

        result = validator.isAlpha(value.categoryDescription.toString(), ['sv-SE'], {ignore: '\' '});
        
        assert(
            result,
            `${varName} categoryDescription should consist only of letters.`,
        );

        //result = validator.isAlpha(value.lastName.toString(), ['sv-SE'], {ignore: '\''});

        result = this.isNonNegativeNumber(value.categoryId, 'CategoryId');

        result = this.isDateFormat(value.dateOfRegistration, 'Date of registration');

        result = this.isTimeFormat(value.timeOfRegistration, 'Time of registration');
    }

    /**
     * 
     * @param {*} value 
     * @param {*} varName 
     */
    static userApprovalStatus(value, varName) {
        let result = false;

        if (value.toString() === 'null' ||
            value.toString() === 'true' ||
            value.toString() === 'false') {
            result = true;
        }

        assert(
            result,
            `${varName} should be one of the following values, undefined, true or false.`,
        );
    }

    
}

module.exports = Validators;
