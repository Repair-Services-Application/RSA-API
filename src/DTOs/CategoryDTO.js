'use strict';

const Validators = require('../utilities/Validators');

/**
 * A class of Category data as categoryId, categoryDescription and the specified category's parentCategoryId.
 */
class CategoryDTO{
    
    /**
     * Constructs an instance of the {CategoryDTO} object
     * @param {number} categoryId The specified category's id.
     * @param {string} description The specified category's description.
     * @param {number} parentCategoryId is the parent category of the current Category. It helps for the listing, 
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