'use strict';

const Validators = require('../utilities/Validators');

class CategoryDTO{
    
    /**
     * 
     * @param {*} categoryId 
     * @param {*} description 
     * @param {*} parentCategoryId 
     */
    constructor(categoryId, description, parentCategoryId) {
        Validators.isNonNegativeWholeNumber(categoryId, 'Category Id');
        Validators.isAlphaString(description, 'Category description');
        Validators.isNonNegativeWholeNumber(parentCategoryId, 'Parent Category Id');
        this.categoryId = categoryId;
        this.description = description;
        this.parentCategoryId = parentCategoryId;
    }
}

module.exports = CategoryDTO;