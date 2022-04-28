'use strict';

const { check, validationResult } = require("express-validator");
const Validators = require("../utilities/Validators");
const Authorization = require("./authorization/Authorization");
const ReqHandler = require("./ReqHandler");
const applicationRegistrationErrorEnum = require("../utilities/applicationRegistrationErrorEnum");

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
                check('categoryRelationId').custom((value) => {
                    Validators.isPositiveWholeNumber(value, 'categoryRelationId');
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
                }
            )


        } catch (error) {
            this.logger.Exception(error);
            return null;
        }
    }
}

module.exports = ServiceApiHandler;