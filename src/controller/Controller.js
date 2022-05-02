'use strict';

const NewApplicationDTO = require('../DTOs/NewApplicationDTO');
const ApplicationsFilterParamsDTO = require('../DTOs/ApplicationsFilterParamsDTO');
const SignupDTO = require('../DTOs/SignupDTO');
const RepairmentServiceDAO = require('../integration/RepairmentServiceDAO');
const filtersEmptyParameersEnum = require('../utilities/filtersEmptyParameersEnum');

/**
 * The application's controller.
 * The Controller will be the middle-man between model and integration layers. No access from one to another outside the controller.
 */
class Controller {
    /**
     * Constructs an instance of Controller 
     * Create an instance of the {RepairmentServiceDAO} object.
     */
    constructor() {
        this.repairmentServiceDAO = new RepairmentServiceDAO();
    }

    /**
     * create a new instance of Controller.
     * @returns the new created instance of controller.
     */
    static async createControllerInstance() {
        const controller = new Controller();
        await controller.repairmentServiceDAO.establishTheConnection();
        return controller;
    }

    /**
     * Login user cvalidated recieved data from {UserApiHandler} and send it to loginUser method in {repairmentServiceDAO}.
     * @param {string} username the user's username that is trying to log in.
     * @param {string} password the user's password that is trying to log in.
     * @returns {UserDTO | null} userDTO containing the logged in userDTO, or null when the login process fails. 
     */
    async loginUser(username, password) {
        const userDTO = await this.repairmentServiceDAO.loginUser(username, password);
        return userDTO;
    }

    /**
     * Signup a new user, using the validated recieved data from {UserApiHandler} and return the data from signupUser 
     * method in the {repairmentServiceDAO}.
     * @param {string} firstname the new user's firstname.
     * @param {string} lastname the new user's lastname.
     * @param {string} personalNumber the new user's personalNumber. IT should follow the format YYYYMMDD-XXXX.
     * @param {string} email the new user's email adress.
     * @param {string} username the new user's username that will be used later for the login process.
     * @param {string} password the new user's password that will be used later for the login process.
     * @param {string} mobileNumber the new user's mobileNumber.
     * @returns {UserDTO | null} userDTO containing the logged in userDTO, or null when the login process fails. 
     */
    async signupUser(firstname, lastname, personalNumber, email, username, password, mobileNumber) {
        const signupDTO = new SignupDTO(firstname, lastname, personalNumber, email, username, password, mobileNumber);
        const userDTO = this.repairmentServiceDAO.signupUser(signupDTO);
        return userDTO;
    }

    /**
     * get the loggedIn user's categories that will be used in teh applications registration.
     * @returns {CategoryDTO[] | null} containging a list of the categories descriptions and their ids. 
     * null if the getCategories process failes
     */
    async getCategories(rootCateogryId) {
        const categoriesList = this.repairmentServiceDAO.getCategories(rootCateogryId);
        return categoriesList;
    }

    /**
     * Registering a new application using the recieved data from the {ServiceApiHandler}.
     * @param {UserDTO} userDTO the loggedIn userDTO, conatining the user's username, roleId, and errorCode.
     * @param {number} categoryId The specified application's category id. It should be positive number.
     * @param {string} problemDescription The application's problem description, it should not be empty.
     * @returns {ApplicationRegistrationDTO | null}  containing the application Id and errorCode. 
     * It returns null, if the application registartion fails.
     */
    async registerApplication(userDTO, categoryId, problemDescription) {
        const newApplicationDTO = new NewApplicationDTO(userDTO.username, categoryId, problemDescription);
        const applicationRegistrationDTO = await this.repairmentServiceDAO.registerNewApplication(userDTO, newApplicationDTO);
        return applicationRegistrationDTO;
    }

    /**-
     * Filtering applications by worker using some paramters recieved from the {ServiceApiHandler}, 
     * and return the result from the {repairmentServiceDAO}.
     * @param {number} applicationId Filtering according to application's Id.
     * @param {number} categoryId Filtering according to category id.
     * @param {string} firstname Filtering according to users' first names
     * @param {string} lastname Filtering according to users' last name.
     * @param {string} dateOfRegistrationFrom Filtering according to application registartion's range starts from.
     * @param {string} dateOfRegistrationTo Filtering according to application registration's range ends to.
     * @param {number} suggestedPriceFrom Filtering according to reparation's suggested price range by worker starts from.
     * @param {number} suggestedPriceTo Filtering according to reparation's suggested price range by worker ends to.
     * @param {number} reparationStatusId Filtering according to the reparation's status id.
     * @returns {ApplicationsFilteredListDTO | null} a list contains the filtered list according to the chosen filters.
     * It returns null if the getApplicationsByWorker() process fails.
     */
    async getApplicationsByWorker(applicationId, categoryId, firstname, lastname, dateOfRegistrationFrom, 
        dateOfRegistrationTo, suggestedPriceFrom, suggestedPriceTo, reparationStatusId) {
         
            const applicationsFilterParamsDTO = await this._createApplicationsFiltersDTO(applicationId, categoryId, firstname, lastname, 
                dateOfRegistrationFrom, dateOfRegistrationTo, suggestedPriceFrom, suggestedPriceTo, reparationStatusId);
            const applicationsListDTO = await this.repairmentServiceDAO.getApplicationsListByWorker(applicationsFilterParamsDTO);
            return applicationsListDTO
        }


    /**
     * Get application's details using the application Id, 
     * and userDTO to check if the logged in user is eligible for showing the application's details or not.
     * @param {number} applicationId the specified application's id.
     * @param {UserDTO} userDTO The logged in userDTO.
     * @returns {ApplicationDetailsDTO | null} a DTO contains the details of the application.
     * It returns null if the getApplcationDetails process fails.
     */
    async getApplicationDetails(applicationId, userDTO) {
        const applicationDetailsDTO = await this.repairmentServiceDAO.returnApplicationDetails(applicationId, userDTO);
        return applicationDetailsDTO;
    }


    /**
     * Get the user's personal applications list using the loggedIn user's username from userDTO.
     * @param {UserDTO} userDTO contains the loggedIn userDTO.
     * @returns {PersonalApplicationsListDTO | null} a object of the personal applications list. 
     * Null of the returnPersonalApplicationsListDTO() process fails
     */
    async getPersonalApplicationsListDTO(userDTO) {
        const personalApplicationsListDTO = await this.repairmentServiceDAO.returnPersonalApplicationsListDTO(userDTO);
        return personalApplicationsListDTO;
    }

    /**
     * This is a private function which is being called by the getApplicationsByWorker() in Controller. 
     * It declares the parameters if empty or other data to by accepted by Validators.
     * @param {number} applicationId The application's Id. 
     * @param {number} categoryId The category's id
     * @param {string} firstname The user's firstname.
     * @param {string} lastname The user's lastname.
     * @param {string} dateOfRegistrationFrom The application registration date range starts from.
     * @param {string} dateOfRegistrationTo The application registration date range end to.
     * @param {number} suggestedPriceFrom The worker's suggested price range for the applications starts from.
     * @param {number} suggestedPriceTo The worker's suggested price range for the applications ends to.
     * @param {number} reparationStatusId The id of the reparation's status.
     * @returns {ApplicationsFilterParamsDTO} return a fixed ApplicationsFilterParamsDTO with acceatpable data.
     */
    async _createApplicationsFiltersDTO(applicationId, categoryId, firstname, lastname, dateOfRegistrationFrom, 
        dateOfRegistrationTo, suggestedPriceFrom, suggestedPriceTo, reparationStatusId) {
            
            console.log('suggestedPriceFrom: ' + suggestedPriceFrom);

            let requestedApplicationId = parseInt(applicationId);
            let requestedCategoryId = parseInt(categoryId);
            let requestedFirstname = firstname;
            let requestedLastname = lastname;
            let requestedDateOfRegistrationFrom = dateOfRegistrationFrom;
            let requestedDateOfRegistrationTo = dateOfRegistrationTo;
            let requestedSuggestedPriceFrom =  parseInt(suggestedPriceFrom);
            let requestedSuggestedPriceTo = parseInt(suggestedPriceTo);
            let requestedReparationStatusId = parseInt(reparationStatusId);

            if(applicationId === 0 || applicationId === '') {
                requestedApplicationId = filtersEmptyParameersEnum.ApplicationID;
            }
            if(categoryId === 0 || categoryId === 0) {
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
            if(suggestedPriceFrom === 0 || suggestedPriceFrom === ''){
                requestedSuggestedPriceFrom = filtersEmptyParameersEnum.Price;
            }
            if(suggestedPriceTo === 0 || suggestedPriceTo === 0) {
                requestedSuggestedPriceTo = filtersEmptyParameersEnum.Price;
            }
            if(reparationStatusId === 0 || reparationStatusId === 0) {
                requestedReparationStatusId = filtersEmptyParameersEnum.ReparationStatusId;
            }

            const applicationsFilterParamsDTO = new ApplicationsFilterParamsDTO(requestedApplicationId, requestedCategoryId, 
                requestedFirstname, requestedLastname, requestedDateOfRegistrationFrom, requestedDateOfRegistrationTo, 
                requestedSuggestedPriceFrom, requestedSuggestedPriceTo, requestedReparationStatusId);
            
            return applicationsFilterParamsDTO;

        }


}


module.exports = Controller;