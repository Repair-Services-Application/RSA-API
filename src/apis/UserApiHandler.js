'use strict';

const { check, validationResult } = require("express-validator");
const ReqHandler = require("./ReqHandler");
const Authorization = require('./authorization/Authorization');
const userErrorCodesEnum = require("../utilities/userErrorCodesEnum");
const Validators = require("../utilities/Validators");

/**
 * Handles the REST API for the related user's endpoints.
 */
class UserApiHandler extends ReqHandler {
    /**
     * A constructor fo the UserApiHandler creating an instance of it.
     */
    constructor() {
        super();
    }

    /**
     * @return {string} The URL paths handled by the UserApiHandler.
     */
    get path() {
        return UserApiHandler.USER_API_PATH;
    }

    /**
     * @return {string} the root path of the User Api enpoints paths.
     */
    static get USER_API_PATH() {
        return '/user';
    }

    /**
    * Registers the requests handlers. 
    */
    async registerHandler() {
        try {
            await this.fetchController();

            /**
             * Login a user. Handles the login request.
             * The username and password and validated in the request before starting the Login process.
             * Database ErrorHandling occurs in the {ErrorUserHandler}.
             * 
             * Parameters:  username:   The used username for the login request, 
             *                          which will be also used as a display name. It must be alphanumeric.
             *              password:   The used password for the specified username. It is used for the authentication process, 
             *                          it's length must consist of at least 8 letter/characters/symbols/etc.
             * 
             * Sends:       200:        If the user has successfully authenticated, and it return a {UserDTO}.
             *              400:        If the entered data was malformed, or the request body didn't contain 
             *                          the username and password fields and data.
             *              401:        If the authentication process failed.
             * Throws:      {Error}     If the controller return unexpected data, or connection error to the database.
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
             * Signup a new user. Handles the signup request.
             * The entered parameters are validated in the request before starting the signup process.
             * Database ErrorHandling occurs in the {ErrorUserHandler}.
             * 
             * Parameters:  firstname:      The new user's first name, and it must consist only of letters.
             *              lastname:       The new user's last name, and it must consist only of letters.
             *              personalNumber: The new user's personalNumber and it should follow the format YYYYMMDD-XXXX.
             *              email:          The new user's email that can be contacted via. 
             *              username:       The used username for the login request, 
             *                              which will be also used as a display name. It must be alphanumeric.
             *              password:       The used password for the specified username. It is used for the authentication process, 
             *                              it's length must consist of at least 8 letter/characters/symbols/etc.
             *              mobileNumber:   The new user's mobile number. 
             * 
             * Sends:       200:            If the user has successfully registered and authenticated, and it return a {UserDTO} object.
             *              400:            If the entered data was malformed, or the request body didn't contain 
             *                              the username and password fields and data.
             *              401:            If the authentication process failed.
             * Throws:     {Error}          If the controller return unexpected data, or connection error to the database.
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

            /**
             * Check if the user is a logged in or not, or if the authentication maxage has reached.
             * 
             * Sends:       200:        If the send request conatined a valid authentication cookie, and it returns a {UserDTO}.
             *              401:        If the authentication process failed or the authentication cookie is missing.
             * 
             */
            this.reqRouter.get(
                '/checkLogin',
                async(request, response, next) => {
                    try {
                        const userDTO = await Authorization.verifyRequestAuthCookie(request, response);
                        if(userDTO === null) {
                            Authorization.clearAuthCookie(response);
                            this.sendHTTPResponse(response, 401, 'Invalid Authorization Cookie');
                            return;
                        }
                        else{
                            this.sendHTTPResponse(response, 200, userDTO);
                            return;
                        }


                    } catch (error) {
                        next(error);
                    }
                },
            );


            /**
             * Logout the logged in user by clearing the authentication cookie.
             * 
             * Sends: 200:  When clearing the authentication cookie has succeeded. 
             */
            this.reqRouter.get(
                '/logout',
                async(request, response, next) => {
                    try {
                        
                        Authorization.clearAuthCookie(response);
                        this.sendHTTPResponse(response, 200, 'Logged out Successfully.');
                        return;


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

module.exports = UserApiHandler;