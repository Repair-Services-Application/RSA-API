'use strict';

const Validators = require('../utilities/Validators');

/**
 * A class contains data about the new registered application.
 */
class NewApplicationDTO {

    /**
     * Constructs an instance of {NewApplicationDTO} object, with the passed paramters data.
     * @param {string} username The logged in user's username.
     * @param {number} categoryId The specified categoryId for the application.
     * @param {string} problemDescription The application's problem description.
     */
    constructor(username, categoryId, problemDescription) {
        Validators.isAlphanumericString(username, 'Username');
        Validators.isPositiveWholeNumber(categoryId, 'Category id');
        Validators.isNotEmpty(problemDescription, 'Problem description');

        this.username = username;
        this.categoryId = categoryId;
        this.problemDescription = problemDescription;
    }
    
}

module.exports = NewApplicationDTO;