'use strict';

const Validators = require('../utilities/Validators');

class ApplicationDTO {
    constructor(username, categoryRelationId, problemDescription) {
        Validators.isAlphanumericString(username, 'Username');
        Validators.isPositiveWholeNumber(categoryRelationId, 'Category id');
        Validators.isNotEmpty(problemDescription, 'Problem description');

        this.username = username;
        this.categoryRelationId = categoryRelationId;
        this.problemDescription = problemDescription;
    }
    
}

module.exports = ApplicationDTO;