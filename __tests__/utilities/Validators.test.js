'use strict';

var chai = require('chai');
var expect = chai.expect;
const Validators = require('../../src/utilities/Validators');
const Logger = require("../../src/utilities/Logger");

let validators = null;

beforeAll(async () => {
    //validators = new Validators();
    this.logger = new Logger('validaorsTestLogger');
});

describe('test if the integer is between the lowerLimit and upperLimit', () => {
    test('isIntegerBetween', async () => {
        let value = 1;
        let lowerLimit = 0;
        let upperLimit = 3;
        let varName = 'roleID';

        const isIntegerBetweenResult = await Validators.isIntegerBetween(value, lowerLimit, upperLimit, varName);
        expect(isIntegerBetweenResult).to.equal(undefined);
    });
});

describe('test if value consists of letters and/or numbers', () => {
    test('isAlphanumericString', async () => {
        let value = 'User1111';
        let varName = 'username';

        const isAlphanumericStringResult = await Validators.isAlphanumericString(value, varName);
        expect(isAlphanumericStringResult).to.equal(undefined);
    });
});

describe('test if the value consists only of swedish/english letters', () => {
    test('isAlphaString', async () => {
        let valueFirstName = 'Garo';
        let varNameFirstName = 'firstname';
        let valueLastName = 'Bergström';
        let varNameLastName = 'lastName';

        const isAlphaStringFirstNameResult = await Validators.isAlphaString(valueFirstName, varNameFirstName);
        const isAlphaStringLastNameResult = await Validators.isAlphaString(valueLastName, varNameLastName);
        expect(isAlphaStringFirstNameResult).to.equal(undefined);
        expect(isAlphaStringLastNameResult).to.equal(undefined);
    });
});

describe('test if the email if formatted correctly', () => {
    test('isEmailFormat', async () => {
        let value = 'test@test.com';
        let varName = 'email';

        const isEmailFormatResult = await Validators.isEmailFormat(value, varName);
        expect(isEmailFormatResult).to.equal(undefined);
    });
});

describe('test if the value is a valid swedish personal number', () => {
    test('isPersonalNumberFormat', async () => {
        let value = '19850907-5647';
        let varName = 'personalNumber';

        const isPersonalNumberFormatResult = await Validators.isPersonalNumberFormat(value, varName);
        expect(isPersonalNumberFormatResult).to.equal(undefined);
    });
});

describe('test if the value is a positive whole number', () => {
    test('isPositiveWholeNumber', async () => {
        let value = 1;
        let varName = 'positiveWholeNumber';

        const isPositiveWholeNumberResult = await Validators.isPositiveWholeNumber(value, varName);
        expect(isPositiveWholeNumberResult).to.equal(undefined);
    });
});

describe('test if the value consists of letters can be separated by " ", "," and "."', () => {
    test('isDescriptionString', async () => {
        let value = 'Problem description consists, only of letter.';
        let varName = 'descriptionString';

        const isDescriptionStringResult = await Validators.isDescriptionString(value, varName);
        expect(isDescriptionStringResult).to.equal(undefined);
    });
});

describe('test if the value has a date format "YYYY-MM-DD"', () => {
    test('isDateFormat', async () => {
        let value = '2022-04-01';
        let varName = 'dateFormat';

        const isDateFormatResult = await Validators.isDateFormat(value, varName);
        expect(isDateFormatResult).to.equal(undefined);
    });
});

describe('test if the value has a time format "HH:MM:SS"', () => {
    test('isTimeFormat', async () => {
        let value = '19:04:15';
        let varName = 'timeFormat';

        const isTimeFormatResult = await Validators.isTimeFormat(value, varName);
        expect(isTimeFormatResult).to.equal(undefined);
    });
});

describe('test if the value is a valid swedish mobile number', () => {
    test('isValidMobileNumber', async () => {
        let value = '0722323232';
        let varName = 'mobileNumber';

        const isValidMobileNumberResult = await Validators.isValidMobileNumber(value, varName);
        expect(isValidMobileNumberResult).to.equal(undefined);
    });
});

describe('test if the value is not an empty field', () => {
    test('isNotEmpty', async () => {
        let value = 'Not empty text';
        let varName = 'text';

        const isNotEmptyResult = await Validators.isNotEmpty(value, varName);
        expect(isNotEmptyResult).to.equal(undefined);
    });
});