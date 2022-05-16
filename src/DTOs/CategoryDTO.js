'use strict';

const Validators = require('../utilities/Validators');

/**
 * A class of Category data as categoryId, categoryDescription and the specified category's parentCategoryId.
 */
class CategoryDTO{
    
    /**
     * Constructs an instance of the {CategoryDTO} object
     * @param {number} categoryRelationId The specified category relation's id.
     * @param {number} categoryId The specified category's id.
     * @param {string} categoryDescription The specified category's description.
     * @param {number} parentCategoryId is the parent category of the current Category. It helps for the listing, 
     */
    constructor(categoryRelationId, categoryId, categoryDescription, parentCategoryId) {
        Validators.isNonNegativeWholeNumber(categoryRelationId, 'Category Relation Id');
        Validators.isNonNegativeWholeNumber(categoryId, 'Category Id');
        Validators.isAlphaString(categoryDescription, 'Category description');
        Validators.isNonNegativeWholeNumber(parentCategoryId, 'Parent Category Id');
        this.categoryRelationId = categoryRelationId;
        this.categoryId = categoryId;
        this.categoryDescription = categoryDescription;
        this.parentCategoryId = parentCategoryId;
    }
}

module.exports = CategoryDTO;