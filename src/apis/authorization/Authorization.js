'use strict';

const jwt = require('jsonwebtoken');
const repairmentServiceSystemRoles = require('../../utilities/rolesEnum');

/**
 * Handles the user's different authorization levels.
 */
class Authorization {

    /**
     * The name of the repairmentService auth.
     */
    static get AUTH_COOKIE_NAME() {
        return 'repairmentServiceAuth';
    }

    /**
     * Authenticate the logged in user and verify it using the JWT token to verify the auth cookie. 
     * During any error and verification failure, the authentication cookie get cleared.
     * @param {Request} request the express Request object.
     * @param {Response} response the express Response object
     * @returns {UserDTO | null} the UserDTO contains the username, roleId and errorCode.
     * In failure case, a null object is returned.
     */
    static async verifyRequestAuthCookie(request, response) {
        const authenticationCookie = request.cookies.repairmentServiceAuth;
        if (!authenticationCookie) {
            return null;
        }
        else {
            try {
                const secretJsonWebToken = process.env.JWT_SECRET
                const userDTOPayload = jwt.verify(authenticationCookie, secretJsonWebToken);
                const userDTO = userDTOPayload.userDTO;
                return userDTO;
            } catch (error) {
                response.clearCookie(this.AUTH_COOKIE_NAME);
                return null;
            }
        }
    }

    /**
     * Authenticate the logged in user, and verify if the user is user, or not (Worker or Administrator will return false)
     * @param {Request} request the express Request object
     * @returns {UserDTO | null} the UserDTO contains the username, roleId (user roleId) and errorCode.
     * In failure case, a null object is returned.
     */
    static async verifyUserAuth(request) {
        const authorizationCookie = request.cookies.repairmentServiceAuth;
        if(!authorizationCookie) {
            return null;
        }
        try {
            const userDTOPayload = jwt.verify(authorizationCookie, process.env.JWT_SECRET);
            const userDTO = userDTOPayload.userDTO;
            if(userDTO.roleID === repairmentServiceSystemRoles.User) {
                return userDTO;
            }
            else{
                return null;
            }

        } catch (error) {
            return null;
        }
    }

    /**
     * Authenticate the logged in user, and verify if the user is Worker, or not (User or Administrator will return false)
     * @param {Request} request the express Request object
     * @returns {UserDTO | null} the UserDTO contains the username, roleId (Worker roleId) and errorCode.
     * In failure case, a null object is returned.
     */
    static async verifyWorkerAuth(request) {
        const authorizationCookie = request.cookies.repairmentServiceAuth;
        if(!authorizationCookie) {
            return null;
        }
        try {
            const userDTOPayload = jwt.verify(authorizationCookie, process.env.JWT_SECRET);
            const userDTO = userDTOPayload.userDTO;
            if(userDTO.roleID === repairmentServiceSystemRoles.Worker) {
                return userDTO;
            }
            else{
                return null;
            }

        } catch (error) {
            return null;
        }
    }

     /**
     * Authenticate the logged in user, and verify if the user is Administrator, or not (User or Worker will return false)
     * @param {Request} request the express Request object
     * @returns {UserDTO | null} the UserDTO contains the username, roleId (Administrator roleId) and errorCode.
     * In failure case, a null object is returned.
     */
    static async verifyAdministratorAuth(request) {
        const authorizationCookie = request.cookies.repairmentServiceAuth;
        if(!authorizationCookie) {
            return null;
        }
        try {
            const userDTOPayload = jwt.verify(authorizationCookie, process.env.JWT_SECRET);
            const userDTO = userDTOPayload.userDTO;
            if(userDTO.roleID === repairmentServiceSystemRoles.Administrator) {
                return userDTO;
            }
            else{
                return null;
            }

        } catch (error) {
            return null;
        }
    }

     /**
     * Authenticate the logged in user, and verify if the user is Worker or Administrator, or not (User will return false)
     * @param {Request} request the express Request object
     * @returns {UserDTO | null} the UserDTO contains the username, roleId (Worker or Administrator roleId) and errorCode.
     * In failure case, a null object is returned.
     */
    static async verifyWorkerAdminAuth(request) {
        const authorizationCookie = request.cookies.repairmentServiceAuth;
        if(!authorizationCookie) {
            return null;
        }
        try {
            const userDTOPayload = jwt.verify(authorizationCookie, process.env.JWT_SECRET);
            const userDTO = userDTOPayload.userDTO;
            if(userDTO.roleID === repairmentServiceSystemRoles.Worker || 
                userDTO.roleID === repairmentServiceSystemRoles.Administrator) {
                return userDTO;
            }
            else{
                return null;
            }

        } catch (error) {
            return null;
        }
    }

     /**
     * Authenticate the logged in user, and verify if the user is Worker, User or Administrator or not (No logged in user will return false)
     * @param {Request} request the express Request object
     * @returns {UserDTO | null} the UserDTO contains the username, roleId (User, Worker or Administrator roleId) and errorCode.
     * In failure case, a null object is returned.
     */
    static async verifyLoggedInUserAuth(request) {
        const authorizationCookie = request.cookies.repairmentServiceAuth;
        if(!authorizationCookie) {
            return null;
        }
        try {
            const userDTOPayload = jwt.verify(authorizationCookie, process.env.JWT_SECRET);
            const userDTO = userDTOPayload.userDTO;
            if(userDTO.roleID === repairmentServiceSystemRoles.Worker || 
                userDTO.roleID === repairmentServiceSystemRoles.Administrator || 
                userDTO.roleID === repairmentServiceSystemRoles.User) {
                return userDTO;
            }
            else{
                return null;
            }

        } catch (error) {
            return null;
        }
    }



    /**
     * Set a new secure authentication cookie to the logged in user with age for 1 week, 
     * and sign it using the JWT_SECRET.
     * - The samesite and secureCookie options are required here since 
     * the Express app and the React app will be hosted on different hosts.
     * @param {UserDTO} userDTO an object contains the username, roleId, and a list of error code 
     * (it may contain Ok, or other errors codes specified in userErrorCodesEnum.js).
     * @param {Response} response the express Response object.
     */
    static setAuthCookie(userDTO, response) {
        const httpOnlyCookie = {httpOnly: true};
        const cookieAge = {maxAge: 7 * 86400 * 1000} // 1 week
        const sameSite = {sameSite: 'None'};
        const secureCookie = {secure: true};
        const jwtToken = jwt.sign(
            {userDTO}, process.env.JWT_SECRET,
            { expiresIn: '7 days',},
        );

        const cookieOptions = {
            ...httpOnlyCookie,
            ...cookieAge,
            ...sameSite,
            ...secureCookie,

        };
        response.cookie(this.AUTH_COOKIE_NAME, jwtToken, cookieOptions);

    }


    /**
     * Clears the signed auth token 
     * - The samesite and secureCookie options are required here since 
     * the Express app and the React app will be hosted on different hosts.
     * @param {Response} response the express Response object. 
     */
    static clearAuthCookie(response) {
        const httpOnlyCookie = {httpOnly: true};
        const sameSite = {sameSite: 'None'};
        const secureCookie = {secure: true};

        const cookieOptions = {
            ...httpOnlyCookie,
            ...sameSite,
            ...secureCookie,
        };

        response.clearCookie(this.AUTH_COOKIE_NAME, cookieOptions);
    }

}

module.exports = Authorization;