'use strict';

const jwt = require('jsonwebtoken');
const repairmentServiceSystemRoles = require('../../utilities/rolesEnum');

class Authorization {

    static get AUTH_COOKIE_NAME() {
        return 'repairmentServiceAuth';
    }

    /**
     * 
     * @param {*} request 
     * @param {*} response 
     * @returns 
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
     * 
     * @param {*} request 
     * @returns 
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
     * 
     * @param {*} request 
     * @returns 
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
     * 
     * @param {*} request 
     * @returns 
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
     * 
     * @param {*} request 
     * @returns 
     */
    static async verifyWorkerAdminAuth(request) {
        const authorizationCookie = request.cookies.repairmentServiceAuth;
        if(!authorizationCookie) {
            return null;
        }
        try {
            const userDTOPayload = jwt.verify(authorizationCookie, process.env.JWT_SECRET);
            const userDTO = userDTOPayload.userDTO;
            if(userDTO.roleID === repairmentServiceSystemRoles.Worker || userDTO.roleID === repairmentServiceSystemRoles.Administrator) {
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
     * 
     * @param {*} userDTO 
     * @param {*} response 
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
     * 
     * @param {*} response 
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