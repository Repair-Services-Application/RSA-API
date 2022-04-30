'use strict';

const { check, validationResult } = require("express-validator");
const Validators = require("../utilities/Validators");
const Authorization = require("./authorization/Authorization");
const ReqHandler = require("./ReqHandler");
const applicationRegistrationErrorEnum = require("../utilities/applicationRegistrationErrorEnum");
const applicationErrorCodesEnum = require("../utilities/applicationErrorCodesEnum");

class ServiceApiHandler extends ReqHandler {
    constructor() {
        super();
    }

    get path() {
        return ServiceApiHandler.SERVICE_API_PATH;
    }

    static get SERVICE_API_PATH() {
        return '/service';
    }

    async registerHandler() {
        try {
            await this.fetchController();

            this.reqRouter.get(
                '/getCategories',
                async(request, response, next) => {
                    try {
                        const userDTO = await Authorization.verifyRequestAuthCookie(request, response);

                        if(userDTO === null) {
                            Authorization.clearAuthCookie(response);
                            this.sendHTTPResponse(response, 401, 'Invalid authorization cookie found.');
                            return;
                        }
                        else {
                            const categoriesList = await this.controller.getCategories();
                            if (categoriesList === null) {
                                throw new Error('Expected Category list, received null.');
                            }
                            this.sendHTTPResponse(response, 200, categoriesList);
                            return;
                        }

                    } catch (error) {
                        next(error);
                    }
                }

            )

            this.reqRouter.post(
                '/registerApplication', 
                check('categoryId').custom((value) => {
                    Validators.isPositiveWholeNumber(value, 'categoryId');
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
                                request.body.categoryId, request.body.problemDescription);
                        
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
                }
            )

            this.reqRouter.get(
                '/getApplicationsByWorker',
                check('applicationId').custom((value) => {
                    Validators.isNonNegativeWholeNumber(value, 'applicationId');
                    return true;
                }),
                check('categoryId').custom((value) => {
                    Validators.isNonNegativeWholeNumber(value, 'categoryId');
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
                    // Allow empty last name.
                    if (value === '') {
                        return true;
                    }
                    // This will throw an AssertionError if the validation fails
                    Validators.isAlphaString(value, 'Lastname');
                    // Indicates the success of the custom validator check
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
                    Validators.isNonNegativeNumber(value, 'Suggested price from');
                    return true;
                }),
                check('suggestedPriceTo').custom((value) => {
                    Validators.isNonNegativeNumber(value, 'Suggested price to');
                    return true;
                }),
                check('reparationStatusId').custom((value) => {
                    Validators.isNonNegativeNumber(value, 'Reparation Status Id');
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
                                request.query.categoryId, request.query.firstname ,request.query.lastname , request.query.dateOfRegistrationFrom, 
                                request.query.dateOfRegistrationTo, request.query.suggestedPriceFrom, request.query.suggestedPriceTo, 
                                request.query.reparationStatusId);
                            if(ApplicationsFilteredListDTO === null) {
                                throw new Error('Expected ApplicationsFilteredListDTO object, received null.');
                            }

                            this.sendHTTPResponse(response, 200, ApplicationsFilteredListDTO);
                        }

                    } catch (error) {
                        console.log(error);
                        next(error);

                    }
                }


            )

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
                                this.sendHTTPResponse(response, 400, 'Invalid applicationId, or the logged User cannot view the specified application')
                            }

                            this.sendHTTPResponse(response, 200, applicationDetailsDTO);
                        }
                    }catch(error) {
                        console.log(error);
                        next(error);
                    }
                } 
            )


        } catch (error) {
            this.logger.Exception(error);
            return null;
        }
    }
}

module.exports = ServiceApiHandler;