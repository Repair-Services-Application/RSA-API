'use strict';

const { check, validationResult } = require("express-validator");
const Validators = require("../utilities/Validators");
const Authorization = require("./authorization/Authorization");
const ReqHandler = require("./ReqHandler");
const applicationRegistrationErrorEnum = require("../utilities/applicationRegistrationErrorEnum");
const applicationErrorCodesEnum = require("../utilities/applicationErrorCodesEnum");

/**
 * Handles the REST Api endpoints related to the system's services.
 */
class ServiceApiHandler extends ReqHandler {
    /**
     * Constructs an instance of the {ServiceApiHandler}.
     */
    constructor() {
        super();
    }

    /**
     * @return {string} The URL paths handled by the ServiceApiHandler.
     */
    get path() {
        return ServiceApiHandler.SERVICE_API_PATH;
    }

    /**
     * @return {string} the root path of the Service Api enpoints paths.
     */
    static get SERVICE_API_PATH() {
        return '/service';
    }

    /**
     * Registers the requests handlers. 
     */
    async registerHandler() {
        try {
            await this.fetchController();

            /**
             * Get the available categories from the database. 
             * ErrorHandling occurs in the {ErrorServiceHandler}
             * 
             * sends:   200: If the user is authenticated and returns a list of Categories
             *          401: If authentication is failed.
             * throws:  {Error} if the controller return unexpected data, or connection error to the database.
             */
            this.reqRouter.get(
                '/getCategories',
                async(request, response, next) => {
                    let rootCategoryId = 0;
                    try {
                        const userDTO = await Authorization.verifyRequestAuthCookie(request, response);

                        if(userDTO === null) {
                            Authorization.clearAuthCookie(response);
                            this.sendHTTPResponse(response, 401, 'Invalid authorization cookie found.');
                            return;
                        }
                        else {
                            const categoriesList = await this.controller.getCategories(rootCategoryId);
                            if (categoriesList === null) {
                                throw new Error('Expected Category list, received null.');
                            }
                            this.sendHTTPResponse(response, 200, categoriesList);
                            return;
                        }

                    } catch (error) {
                        next(error);
                    }
                },

            );

            this.reqRouter.get(
                '/getReparationStatusList',
                async(request, response, next) => {
                    try {
                        const userDTO = await Authorization.verifyWorkerAdminAuth(request, response);

                        if(userDTO === null) {
                            Authorization.clearAuthCookie(response);
                            this.sendHTTPResponse(response, 401, 'Invalid authorization cookie found.');
                            return;
                        }
                        else {
                            const getReparationStatusList = await this.controller.getReparationStatusList();
                            if (getReparationStatusList === null) {
                                throw new Error('Expected Reparaion status list, received null.');
                            }
                            this.sendHTTPResponse(response, 200, getReparationStatusList);
                            return;
                        }

                    } catch (error) {
                        next(error);
                    }
                },

            );

            /**
             * Register new applications.
             * This endpoint is only accessible by the normal users (no Worker nor Administrator).
             * ErrorHandling occurs in the {ErrorServiceHandler}.
             * 
             * Paramters:   categoryId:         The categoryId, and must a positive whole number.
             *              problemDescription: The problem description, and it is not allowed to be empty.
             * 
             * sends:       200:    If the user is authenticated as user, and the application has successfully registered.
             *              400:    If the request body's validation was incorrect and data has been entered incorrectly. 
             *              401:    If the authenticated has failed (no logged user, or the logged user has another role than user).
             * 
             * throws:      {Error} If the controller returns unexpected data, or the connection to the database is lost.
             */
            this.reqRouter.post(
                '/registerApplication', 
                check('categoryRelationId').custom((value) => {
                    Validators.isPositiveWholeNumber(value, 'category Relation Id');
                    return true;
                }),
                check('problemDescription').custom((value) => {
                    Validators.isNotEmpty(value, 'Problem description');
                    return true;
                }),
                async (request, response, next) => {
                    try {
                        
                        const errorsOfValidationCheck = validationResult(request);

                        if(!errorsOfValidationCheck.isEmpty()) {
                            this.sendHTTPResponse(response, 400, errorsOfValidationCheck);
                            return;
                        }

                        const userDTO = await Authorization.verifyUserAuth(request);

                        if(userDTO === null) {
                            this.sendHTTPResponse(response, 401, 'Invalid authorization cookie.');
                            return;
                        }
                        else{
                            const applicationRegistrationDTO = await this.controller.registerApplication(userDTO, 
                                request.body.categoryRelationId, request.body.problemDescription);
                        
                            if(applicationRegistrationDTO === null) {
                                throw new Error('Expected ApplicationRegistrationDTO object, received null.');
                            }

                            if(applicationRegistrationDTO.errorCode === applicationRegistrationErrorEnum.OK) {
                                this.sendHTTPResponse(response, 200, applicationRegistrationDTO);
                                return;
                            }else if(applicationRegistrationDTO.errorCode === applicationRegistrationErrorEnum.InvalidUsername) {
                                this.sendHTTPResponse(response, 400, 'The username is not valid (invalid).');
                                return;
                            }else if(applicationRegistrationDTO.errorCode === applicationRegistrationErrorEnum.InvalidRole) {
                                this.sendHTTPResponse(response, 400, 'The logged in user is invalid for submitting an application');
                                return;
                            }else if(applicationRegistrationDTO.errorCode === applicationRegistrationErrorEnum.InvalidCategoryId) {
                                this.sendHTTPResponse(response, 400, 'The chosen category is invalid.');
                                return;
                            }else if(applicationRegistrationDTO.errorCode === applicationRegistrationErrorEnum.AlreadyExistApplication) {
                                this.sendHTTPResponse(response, 400, 'The user has already submitted a similar application.');
                                return;
                            }
                        }

                    } catch (error) {
                        next(error);
                    }
                },
            );

            /**
             * Filter the applications using specific filtering fields. When no data specified in the fields, 
             * there will be no filtering for those fields.
             * This endpoint is only accessible by the workers and Aministrators (no normal users allowed).
             * ErrorHandling occurs in the {ErrorServiceHandler}.
             * 
             * Paramters:   applicationId:      The application Id, and it must be a positive number.
             *              categoryId:         The category Id, and it must a positive whole number.
             *              firstname:          The user's first name, and it can be either empty '' 
             *                                  to ignore the filer options, or must contain only letters.
             *              lastname:           The user's last name, and it can be either empty '' 
             *                                  to ignore the filer options, or must contain only letters.
             *              dateOfRegistrationFrom:
             *                                  The date of registration range starts from: and it must follow 
             *                                  the date form specified in the validator.
             *               dateOfRegistrationTo:
             *                                  the date of registration range ends to: and it must follow the 
             *                                  date form specified in the validator.
             *              suggestedPriceFrom: The suggested price by worker range starts from: and it must by non-negativ number.
             *              suggestedPriceTo:   The suggested price by worker range ends to: and it must by non-negativ number.
             *              reparationStatusId: The id of the reparation staus: and it must consist only of positive number. 
             * 
             * sends:       200:    If the applications' list has been returned successfully.
             *              400:    If the request body's validation was incorrect and data has been entered incorrectly. 
             *              401:    If the authentication verification has failed (no logged user, or the logged user has another role than Worker or Administrator).
             * 
             * throws:      {Error} If the controller returns unexpected data, or the connection to the database is lost.
             */
            this.reqRouter.get(
                '/getApplicationsByWorker',
                check('applicationId').custom((value) => {
                    
                    Validators.isNonNegativeWholeNumber(value, 'applicationId');
                    return true;
                }),
                check('categoryRelationId').custom((value) => {
                    Validators.isNonNegativeWholeNumber(value, 'categoryRelationId');
                    return true;
                }),
                check('firstname').custom((value) => {
                    // Allow empty first name.
                    if (value === '') {
                        return true;
                    }
                    // This will throw an AssertionError if the validation fails
                    Validators.isAlphaString(value, 'Firstname');
                    // Indicates the success of the custom validator check
                    return true;
                }),
                check('lastname').custom((value) => {
                    if (value === '') {
                        return true;
                    }
                    Validators.isAlphaString(value, 'Lastname');
                    return true;
                }),
                check('dateOfRegistrationFrom').custom((value) => {
                    if (value === '') {
                        return true;
                    }
                    Validators.isDateFormat(value, 'Date of registration from');
                    return true;
                }),
                check('dateOfRegistrationTo').custom((value) => {
                    if (value === '') {
                        return true;
                    }
                    Validators.isDateFormat(value, 'Date of registration to');
                    return true;
                }),
                check('suggestedPriceFrom').custom((value) => {
                    Validators.isNonNegativeWholeNumber(value, 'Suggested price from');
                    return true;
                }),
                check('suggestedPriceTo').custom((value) => {
                    Validators.isNonNegativeWholeNumber(value, 'Suggested price to');
                    return true;
                }),
                check('reparationStatusId').custom((value) => {
                    Validators.isNonNegativeWholeNumber(value, 'Reparation Status Id');
                    return true;
                }),
                async (request, response, next) => {
                    try {
                        
                        const errorsOfValidationCheck = validationResult(request);

                        if(!errorsOfValidationCheck.isEmpty()) {
                            this.sendHTTPResponse(response, 400, errorsOfValidationCheck);
                            return;
                        }

                        const workerAdminDTO = await Authorization.verifyWorkerAdminAuth(request);

                        if(workerAdminDTO === null) {
                            this.sendHTTPResponse(response, 401, 'Invalid authorization cookie.');
                            return;
                        }
                        else {
                            const ApplicationsFilteredListDTO = await this.controller.getApplicationsByWorker(request.query.applicationId, 
                                request.query.categoryRelationId, request.query.firstname ,request.query.lastname , request.query.dateOfRegistrationFrom, 
                                request.query.dateOfRegistrationTo, request.query.suggestedPriceFrom, request.query.suggestedPriceTo, 
                                request.query.reparationStatusId);
                            if(ApplicationsFilteredListDTO === null) {
                                throw new Error('Expected ApplicationsFilteredListDTO object, received null.');
                            }

                            this.sendHTTPResponse(response, 200, ApplicationsFilteredListDTO);
                        }

                    } catch (error) {
                        next(error);
                    }
                },


            );

            /**
             * Get the application's details. 
             * ErrorHandling occurs in the {ErrorServiceHandler}
             * 
             * Paramters:   applicationId:  The application Id, and it must be a positive number.
             * 
             * sends:       200: If the user is authenticated and returns a 
             *                   ApplicationDetailsDTO object containing the application's details.
             *              400: If the request body's validation was incorrect and data has been entered incorrectly. 
             *              401: If the authentication has failed (no logged user, or the logged user has another role than Worker or Administrator).
             * throws:  {Error} if the controller return unexpected data, or connection error to the database.
             */
            this.reqRouter.get(
                '/getApplicationDetails',
                check('applicationId').custom((value) => {
                    Validators.isNonNegativeWholeNumber(value, 'applicationId');
                    return true;
                }),
                async (request, response, next) => {

                    try {
                        const errorsOfValidationCheck = validationResult(request);

                        if(!errorsOfValidationCheck.isEmpty()) {
                            this.sendHTTPResponse(response, 400, errorsOfValidationCheck);
                            return;
                        }

                        const userDTO = await Authorization.verifyLoggedInUserAuth(request);

                        if(userDTO === null) {
                            this.sendHTTPResponse(response, 401, 'Invalid authorization cookie.');
                            return;
                        }
                        else{
                            const applicationDetailsDTO = await this.controller.getApplicationDetails(request.query.applicationId, userDTO);

                            if(applicationDetailsDTO === null) {
                                throw new Error('Expected ApplicationDetailsDTO object, received null');
                            }

                            if(applicationDetailsDTO.errorCode === applicationErrorCodesEnum.InvalidID) {
                                this.sendHTTPResponse(response, 400, 'Invalid applicationId, or the logged User cannot view the specified application');
                                return;
                            }
                            else {
                                this.sendHTTPResponse(response, 200, applicationDetailsDTO);
                                return;
                            }
                            
                        }
                    }catch(error) {
                        next(error);
                    }
                }, 
            );

            /**
             * Get the personal registered application according the logged in userDTO (username) froom the database. 
             * ErrorHandling occurs in the {ErrorServiceHandler}
             * 
             * sends:   200: If the user is authenticated and returns a list of personal applications (PersonalApplicationsListDTO object)
             *          401: If authentication is failed (no logged in user authentication).
             * throws:  {Error} if the controller return unexpected data, or connection error to the database.
             */
            this.reqRouter.get(
                '/getPersonalApplications',
                async(request, response, next) => {
                    try {
                        
                        const errorsOfValidationCheck = validationResult(request);

                        if(!errorsOfValidationCheck.isEmpty()) {
                            this.sendHTTPResponse(response, 400, errorsOfValidationCheck);
                            return;
                        }

                        const userDTO = await Authorization.verifyUserAuth(request);

                        if(userDTO === null) {
                            this.sendHTTPResponse(response, 401, 'Invalid authorization cookie.');
                            return;
                        }

                        else {
                            const personalApplicationsListDTO = await this.controller.getPersonalApplicationsListDTO(userDTO);

                            if(personalApplicationsListDTO === null) {
                                throw new Error('Expected PersonalApplicationsListDTO object, received null');
                            }
                            else {
                                this.sendHTTPResponse(response, 200, personalApplicationsListDTO);
                                return;
                            }
                        }
                    } catch (error) {
                        next(error);
                    }
                },
            );

        } catch (error) {
            this.logger.logCurrentException(error);
            return null;
        }
    }
}

module.exports = ServiceApiHandler;