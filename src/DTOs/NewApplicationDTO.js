'use strict';

const Validators = require('../utilities/Validators');

/**
 * A class contains data about the new registered application.
 */
class NewApplicationDTO {

    /**
     * Constructs an instance of {NewApplicationDTO} object, with the passed paramters data.
     * @param {string} username The logged in user's username.
     * @param {number} categoryRelationId The specified categoryRelationId for the application.
     * @param {string} problemDescription The application's problem description.
     */
    constructor(username, categoryRelationId, problemDescription) {
        Validators.isAlphanumericString(username, 'Username');
        Validators.isPositiveWholeNumber(categoryRelationId, 'category Relation Id');
        Validators.isNotEmpty(problemDescription, 'Problem description');

        this.username = username;
        this.categoryRelationId = categoryRelationId;
        this.problemDescription = problemDescription;
    }
    
}

module.exports = NewApplicationDTO;