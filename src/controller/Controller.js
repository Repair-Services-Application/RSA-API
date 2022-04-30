'use strict';

const NewApplicationDTO = require('../DTOs/NewApplicationDTO');
const ApplicationsFilterParamsDTO = require('../DTOs/ApplicationsFilterParamsDTO');
const SignupDTO = require('../DTOs/SignupDTO');
const RepairmentServiceDAO = require('../integration/RepairmentServiceDAO');
const filtersEmptyParameersEnum = require('../utilities/filtersEmptyParameersEnum');


class Controller {
    constructor() {
        this.repairmentServiceDAO = new RepairmentServiceDAO();
    }

    /**
     * 
     * @returns 
     */
    static async createControllerInstance() {
        const controller = new Controller();
        await controller.repairmentServiceDAO.establishTheConnection();
        return controller;
    }

    /**
     * 
     * @param {*} username 
     * @param {*} password 
     * @returns 
     */
    async loginUser(username, password) {
        const userDTO = await this.repairmentServiceDAO.loginUser(username, password);
        return userDTO;
    }

    /**
     * 
     * @param {*} firstname 
     * @param {*} lastname 
     * @param {*} personalNumber 
     * @param {*} email 
     * @param {*} username 
     * @param {*} password 
     * @param {*} mobileNumber 
     * @returns 
     */
    async signupUser(firstname, lastname, personalNumber, email, username, password, mobileNumber) {
        const signupDTO = new SignupDTO(firstname, lastname, personalNumber, email, username, password, mobileNumber);
        const userDTO = this.repairmentServiceDAO.signupUser(signupDTO);
        return userDTO;
    }

    /**
     * 
     * @returns 
     */
    async getCategories() {
        const categoriesList = this.repairmentServiceDAO.getCategories();
        return categoriesList;
    }

    /**
     * 
     * @param {*} userDTO 
     * @param {*} categoryId 
     * @param {*} problemDescription 
     * @returns 
     */
    async registerApplication(userDTO, categoryId, problemDescription) {
        const newApplicationDTO = new NewApplicationDTO(userDTO.username, categoryId, problemDescription);
        const applicationRegistrationDTO = await this.repairmentServiceDAO.registerNewApplication(userDTO, newApplicationDTO);
        return applicationRegistrationDTO;
    }

    /**
     * 
     * @param {*} applicationId 
     * @param {*} categoryId 
     * @param {*} firstname 
     * @param {*} lastname 
     * @param {*} dateOfRegistrationFrom 
     * @param {*} dateOfRegistrationTo 
     * @param {*} suggestedPriceFrom 
     * @param {*} suggestedPriceTo 
     * @param {*} reparationStatusId 
     * @returns 
     */
    async getApplicationsByWorker(applicationId, categoryId, firstname, lastname, dateOfRegistrationFrom, 
        dateOfRegistrationTo, suggestedPriceFrom, suggestedPriceTo, reparationStatusId) {
         
            const applicationsFilterParamsDTO = await this._createApplicationsFiltersDTO(applicationId, categoryId, firstname, lastname, 
                dateOfRegistrationFrom, dateOfRegistrationTo, suggestedPriceFrom, suggestedPriceTo, reparationStatusId);
            const applicationsListDTO = await this.repairmentServiceDAO.getApplicationsListByWorker(applicationsFilterParamsDTO);
            return applicationsListDTO
        }


    /**
     * 
     * @param {*} applicationId 
     * @param {*} userDTO 
     * @returns 
     */
    async getApplicationDetails(applicationId, userDTO) {
        const applicationDetailsDTO = await this.repairmentServiceDAO.returnApplicationDetails(applicationId, userDTO);
        return applicationDetailsDTO;
    }


    /**
     * 
     * @param {*} userDTO 
     */
    async getPersonalApplicationsListDTO(userDTO) {
        const personalApplicationsListDTO = await this.repairmentServiceDAO.returnPersonalApplicationsListDTO(userDTO);
        return personalApplicationsListDTO;
    }

    /**
     * 
     * @param {*} applicationId 
     * @param {*} categoryId 
     * @param {*} firstname 
     * @param {*} lastname 
     * @param {*} dateOfRegistrationFrom 
     * @param {*} dateOfRegistrationTo 
     * @param {*} suggestedPriceFrom 
     * @param {*} suggestedPriceTo 
     * @param {*} reparationStatusId 
     * @returns 
     */
    async _createApplicationsFiltersDTO(applicationId, categoryId, firstname, lastname, dateOfRegistrationFrom, 
        dateOfRegistrationTo, suggestedPriceFrom, suggestedPriceTo, reparationStatusId) {
            
            let requestedApplicationId = parseInt(applicationId);
            let requestedCategoryId = parseInt(categoryId);
            let requestedFirstname = firstname;
            let requestedLastname = lastname;
            let requestedDateOfRegistrationFrom = dateOfRegistrationFrom;
            let requestedDateOfRegistrationTo = dateOfRegistrationTo;
            let requestedSuggestedPriceFrom =  parseInt(suggestedPriceFrom);
            let requestedSuggestedPriceTo = parseInt(suggestedPriceTo);
            let requestedReparationStatusId = parseInt(reparationStatusId);

            if(applicationId === 0) {
                requestedApplicationId = filtersEmptyParameersEnum.ApplicationID;
            }
            if(categoryId === 0) {
                requestedCategoryId = filtersEmptyParameersEnum.CategoryID;
            }
            if(firstname === '') {
                requestedFirstname = filtersEmptyParameersEnum.Name;
            }
            if(lastname === '') {
                requestedLastname = filtersEmptyParameersEnum.Name;
            }
            if(dateOfRegistrationFrom === '') {
                requestedDateOfRegistrationFrom = filtersEmptyParameersEnum.Date;
            }
            if(dateOfRegistrationTo === '') {
                requestedDateOfRegistrationTo = filtersEmptyParameersEnum.Date;
            }
            if(suggestedPriceFrom === 0){
                requestedSuggestedPriceFrom = filtersEmptyParameersEnum.Price;
            }
            if(suggestedPriceTo === 0) {
                requestedSuggestedPriceTo = filtersEmptyParameersEnum.Price;
            }
            if(reparationStatusId === 0) {
                requestedReparationStatusId = filtersEmptyParameersEnum.ReparationStatusId;
            }

            const applicationsFilterParamsDTO = new ApplicationsFilterParamsDTO(requestedApplicationId, requestedCategoryId, 
                requestedFirstname, requestedLastname, requestedDateOfRegistrationFrom, requestedDateOfRegistrationTo, 
                requestedSuggestedPriceFrom, requestedSuggestedPriceTo, requestedReparationStatusId);
            
            return applicationsFilterParamsDTO;

        }


}


module.exports = Controller;