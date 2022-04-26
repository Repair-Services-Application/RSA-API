'use strict';

const pbkdf2 = require("pbkdf2");
const { Client, types } = require("pg");
const UserDTO = require("../DTOs/UserDTO");
const repairmentServiceSystemRoles = require('../utilities/rolesEnum');
const userErrorCodesEnum = require('../utilities/userErrorCodesEnum');

class RepairmentServiceDAO {
    constructor() {

        const idOfDateObject = 1082;
        const defaultRawParser = (value) => value;
        types.setTypeParser(idOfDateObject, defaultRawParser);

        this.client = new Client({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT,
            connectionTimeoutMillis: 6000,
            statement_timeout: 2000,
            query_timeout: 2000,
            //ssl: {rejectUnauthorized: false},
            
        });

        //this.logger = new Logger('DatabaseHandlerLogger');
        this.pageLimit = 30;
    }

    async establishTheConnection() {
        try {
            this.client.on('error', (error) => {
                this.client._connecting = true;
                this.client._connected = false;
                this.client._connectionError = true;
                //this.logger.logException(error);
                console.log('error while trying to connect to the db');
            });
            await this.client.connect();
        } catch (error) {
            //this.logger.logException(error);
            console.log(error);
        }
        
    }

    async loginUser(username, password) {
        const hashedPass = await this._generateHashedPassword(username, password);
        const loginQueryContent = {

            text: `SELECT DISTINCT login_info.username,
                            person.role_id
                    FROM    public.login_info
                    INNER JOIN
                            public.person ON
                            (public.login_info.person_id = public.person.id)
                    WHERE
                        public.login_info.username = $1 AND
                        public.login_info.password = $2`,
            values: [username, hashedPass],
        }
        
        try {
            const connection = await this._checkClientConnection();
            if(!connection) {
                return null;
            }
            await this._runQuery('BEGIN');
            const results = await this._runQuery(loginQueryContent);
            
            let returnedUserDTO;
            if(results.rowCount <= 0) {
                returnedUserDTO = new UserDTO(username, repairmentServiceSystemRoles.Invalid, userErrorCodesEnum.LoginFailure);
            }
            else {
                returnedUserDTO = new UserDTO(username, results.rows[0].role_id, userErrorCodesEnum.OK);
            }

            await this._runQuery('COMMIT');

            return returnedUserDTO;

        } catch (error) {
            //this.logger.logException(error);
            console.log('catch');
            return null;
        }
    }

    async signupUser(signupDTO) {
        const hashedPass = await this._generateHashedPassword(signupDTO.username, signupDTO.password);
        const emailCheckQueryContent = {

            text: ` SELECT    *
                    FROM    contact_info
                    WHERE    contact_info.email = $1`,
            values: [signupDTO.email],
        }
        const usernameCheckQueryContent = {

            text: ` SELECT    *
                    FROM    login_info
                    WHERE    login_info.username = $1`,
            values: [signupDTO.username],
        }

        const personalNumberCheckQueryContent = {
            text: ` SELECT 	*
                    FROM 	public.person
                    WHERE	person.personal_number = $1`,
            values: [signupDTO.personalNumber],           
        }


        const registerNewUserQueryContent = {
            text: ` WITH new_user AS (
                                INSERT INTO person(first_name, last_name, personal_number,role_id)
                                VALUES ($1, $2, $3, $4) RETURNING person.id),
                    new_user_contact_info AS (
                                INSERT INTO contact_info (email, mobile_number, person_id)
                                VALUES ($5, $6,
                                            (SELECT new_user.id
                                            FROM new_user))
                                RETURNING contact_info.person_id)
                    INSERT INTO login_info (username, password, person_id)
                    VALUES ($7, $8,
                                            (SELECT new_user.id
                                            FROM new_user))RETURNING login_info.person_id`,
            values: [signupDTO.firstname, signupDTO.lastname, signupDTO.personalNumber, repairmentServiceSystemRoles.User, 
                        signupDTO.email, signupDTO.mobileNumber, signupDTO.username, hashedPass],           
        }

        try {
            
            const connection = await this._checkClientConnection();

            if(!connection) {
                return null;
            }

            await this._runQuery('BEGIN');

            const emailChecking = await this._runQuery(emailCheckQueryContent);
            const usernameChecking = await this._runQuery(usernameCheckQueryContent);
            const personalNumberChecking = await this._runQuery(personalNumberCheckQueryContent);

            let returnedUserDTO;

            console.log('emailChecking: ' + emailChecking.rowCount);
            console.log('usernameChecking: ' + usernameChecking.rowCount);
            console.log('personalNumberChecking: ' + personalNumberChecking.rowCount);

            if (emailChecking.rowCount > 0) {
                returnedUserDTO = new UserDTO(signupDTO.username, repairmentServiceSystemRoles.Invalid, userErrorCodesEnum.EmailAlreadyInUse);
            }
            else if (usernameChecking.rowCount > 0) {
                returnedUserDTO = new UserDTO(signupDTO.username, repairmentServiceSystemRoles.Invalid, userErrorCodesEnum.UsernameAlreadyInUse);
            }
            else if (personalNumberChecking.rowCount > 0) {
                returnedUserDTO = new UserDTO(signupDTO.username, repairmentServiceSystemRoles.Invalid, userErrorCodesEnum.PersonalNumberAlreadyInUse);
            }
            else {
                console.log('else, everything ok: ' );
                await this._runQuery(registerNewUserQueryContent);
                returnedUserDTO = new UserDTO(signupDTO.username, repairmentServiceSystemRoles.User, userErrorCodesEnum.OK);
            }

            await this._runQuery('COMMIT');

            return returnedUserDTO;



        } catch (error) {
            console.log('error: ' + error);
            //this.logger.logException(error);
            return null;
        }
        
    }





    async _runQuery(queryContent) {
        try {
            const results = await this.client.query(queryContent);
            return results;
        } catch (error) {
            const connection = await this.client._checkConnection();
            if(connection) {
                await this.client.query('ROLLBACK');
            }
            throw error;
        }
    }

    async _generateHashedPassword(username, password) {
        const defaultSalt = process.env.GLOBAL_SALT;
        const userUniqueSalt = defaultSalt + ':' + username;
        const encryptedPassBuffer = pbkdf2.pbkdf2Sync(password, userUniqueSalt, 26, 32, 'sha512');
        const utfHexBuffer = Buffer.from(encryptedPassBuffer, 'utf8');        
        return utfHexBuffer.toString('hex');
    }


    async _checkClientConnection() {
        try {
            return this.client._connected;
        } catch (error) {
            throw error;
        }
    }

}


module.exports = RepairmentServiceDAO;