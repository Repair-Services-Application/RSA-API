'use strict';

const { check, validationResult } = require("express-validator");
const {phone} = require('phone')
const ReqHandler = require("./ReqHandler");
const Authorization = require('./authorization/Authorization');
const userErrorCodesEnum = require("../utilities/userErrorCodesEnum");
const Validators = require("../utilities/Validators");

class UserApiHandler extends ReqHandler {
    constructor() {
        super();
    }

    get path() {
        return UserApiHandler.USER_API_PATH;
    }

    static get USER_API_PATH() {
        return '/user';
    }

    async registerHandler() {
        try {
            await this.fetchController();

            /**
             * 
             */
            this.reqRouter.post(
                '/login',
                check('username').isAlphanumeric(),
                check('password').isLength({min: 8}),
                async (request, response, next) => {
                    try {

                        const errorsOfValidationCheck = validationResult(request);

                        if (!errorsOfValidationCheck.isEmpty()) {
                            Authorization.clearAuthCookie(response);
                            this.sendHTTPResponse(response, 400, errorsOfValidationCheck);
                            return;
                        }
                        
                        const logedinUserDTO = await this.controller.loginUser(request.body.username, request.body.password);
                        if (logedinUserDTO === null) {
                            Authorization.clearAuthCookie(response);
                            throw new Error('Expected UserDTO object, received null');
                        }
                        else if (logedinUserDTO.errorCode === userErrorCodesEnum.OK) {
                            Authorization.setAuthCookie(logedinUserDTO, response);
                            this.sendHTTPResponse(response, 200, logedinUserDTO);
                        }
                        else {
                            Authorization.clearAuthCookie(response);
                            this.sendHTTPResponse(response, 401, 'User login failed.');
                            return;
                        }

                        
                    } catch (error) {
                        next(error);
                    }
                },
            );

            /**
             * 
             */
            this.reqRouter.post(
                '/signup',
                check('firstname').isAlpha(),
                check('lastname').isAlpha(),
                check('personalNumber').custom((value) => {
                    Validators.isPersonalNumberFormat(value, 'personalNumber');
                    return true;
                }),
                check('email').normalizeEmail().isEmail(),
                check('username').isAlphanumeric(),
                check('password').isLength({min: 8}),
                check('mobileNumber').custom((value) => {
                    Validators.isValidMobileNumber(value, 'mobileNumber');
                    return true;
                }),
                //console.log('mobileNumber'),
                async (request, response, next) => {
                    try {    
                        
                        const errorsOfValidationCheck = validationResult(request);

                        if (!errorsOfValidationCheck.isEmpty()) {
                            Authorization.clearAuthCookie(response);
                            this.sendHTTPResponse(response, 400, errorsOfValidationCheck);
                            return;
                        }
                        
                        const newSignedupUserDTO = await this.controller.signupUser(request.body.firstname, request.body.lastname, 
                            request.body.personalNumber, request.body.email, request.body.username, request.body.password, request.body.mobileNumber);

                            console.log('newSignedupUserDTO: '+ newSignedupUserDTO);
                        if(newSignedupUserDTO === null) {
                            Authorization.clearAuthCookie(response);
                            throw new Error('Expected UserDTO object, received null');
                        }
                        else if(newSignedupUserDTO.errorCode === userErrorCodesEnum.OK) {
                            Authorization.setAuthCookie(newSignedupUserDTO, response);
                            this.sendHTTPResponse(response, 200, newSignedupUserDTO);
                            
                        }
                        else {
                            if(newSignedupUserDTO.errorCode === userErrorCodesEnum.EmailAlreadyInUse) {
                                Authorization.clearAuthCookie(response);
                                this.sendHTTPResponse(response, 400, 'Email is already in use.');
                            }
                            else if(newSignedupUserDTO.errorCode === userErrorCodesEnum.UsernameAlreadyInUse) {
                                Authorization.clearAuthCookie(response);
                                this.sendHTTPResponse(response, 400, 'Username is already in use.');
                            }
                            else if(newSignedupUserDTO.errorCode === userErrorCodesEnum.PersonalNumberAlreadyInUse) {
                                Authorization.clearAuthCookie(response);
                                this.sendHTTPResponse(response, 400, 'Personal number is already in use.');
                            }
                            else {
                                Authorization.clearAuthCookie(response);
                                this.sendHTTPResponse(response, 400, 'The user signup has failed.');
                            }
                        }
                        return;
                    }
                    catch (error) {
                        next(error);
                    }
                },

            );


        } catch (error) {
            
        }
    }
}

module.exports = UserApiHandler;