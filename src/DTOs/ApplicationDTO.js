'use strict';

const Validators = require('../utilities/Validators');

class ApplicationDTO {
    constructor(username, categoryId, problemDescription) {
        Validators.isAlphanumericString(username, 'Username');
        Validators.isPositiveWholeNumber(categoryId, 'Category id');
        Validators.isNotEmpty(problemDescription, 'Problem description');

        this.username = username;
        this.categoryId = categoryId;
        this.problemDescription = problemDescription;
    }
    
}

module.exports = ApplicationDTO;