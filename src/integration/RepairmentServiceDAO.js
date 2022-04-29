'use strict';

const pbkdf2 = require("pbkdf2");
const { Client, types } = require("pg");
const ApplicationRegistrationDTO = require("../DTOs/ApplicationRegistrationDTO");
const CategoryDTO = require("../DTOs/CategoryDTO");
const UserDTO = require("../DTOs/UserDTO");
const repairmentServiceSystemRoles = require('../utilities/rolesEnum');
const userErrorCodesEnum = require('../utilities/userErrorCodesEnum');
const applicationRegistrationErrorEnum = require('../utilities/applicationRegistrationErrorEnum');
const filtersEmptyParameersEnum = require("../utilities/filtersEmptyParameersEnum");
const ApplicationsFilteredListDTO = require("../DTOs/ApplicationsFilteredListDTO");

class RepairmentServiceDAO {
    
    /**
     * 
     */
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

    /**
     * 
     */
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

    /**
     * 
     * @param {*} username 
     * @param {*} password 
     * @returns 
     */
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
            return null;
        }
    }

    /**
     * 
     * @param {*} signupDTO 
     * @returns 
     */
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
                await this._runQuery(registerNewUserQueryContent);
                returnedUserDTO = new UserDTO(signupDTO.username, repairmentServiceSystemRoles.User, userErrorCodesEnum.OK);
            }

            await this._runQuery('COMMIT');

            return returnedUserDTO;



        } catch (error) {
            //this.logger.logException(error);
            return null;
        }
        
    }

    /**
     * 
     */
    async getCategories() {
        let rootCateogry = 0;
        
        const getCategoriesQuery = {
            text: ` SELECT  category_relation.category_id,
                            category.description,
                            category_relation.parent_category_id
                    FROM    public.category_relation category_relation
                            INNER JOIN public.category category ON (category_relation.category_id = category.id)
                    WHERE   parent_category_id = $1`,
            values: [rootCateogry],
        };

        try {
            let returnedList = [];
            const clientConnection = this._checkClientConnection();

            if(clientConnection === null) {
                return null;
            }

            await this._runQuery('BEGIN');
            const categoriesResult = await this._runQuery(getCategoriesQuery);
            if(categoriesResult.rowCount <= 0) {
                returnedList = [];
            }
            else{
                for (let i = 0; i < categoriesResult.rowCount; i++) {

                    const currentCategory = new CategoryDTO(categoriesResult.rows[i].category_id, 
                        categoriesResult.rows[i].description, categoriesResult.rows[i].parent_category_id);

                    returnedList[i] = currentCategory;
                    }
            }

            await this._runQuery('COMMIT');

            return returnedList;
            

        } catch (error) {
            this.logger.logException(error);
            return null;
        }
    }

    async registerNewApplication(userDTO, applicationDTO) {

        const categoryCheckQuery = {
            text: `SELECT 	* 
            FROM 	public.category_relation
            WHERE 	category_id = $1`,
            values: [applicationDTO.categoryId],
        };

        const applicationDuplicateCheck = {
            text: `SELECT     id
            FROM     public.application
            WHERE    problem_description = $1 and
                     category_relation_id = $2 and 
					 person_id = (SELECT  person_id
                                        FROM    public.login_info
                                        WHERE   username = $3)`,
            values: [applicationDTO.problemDescription, applicationDTO.categoryId, applicationDTO.username],
        };

        const newApplicationQuery = {
            text: `INSERT INTO public.application(
                                        date_of_registration,
                                        problem_description,
                                        category_relation_id,
                                        person_id)
                VALUES                  (NOW()::timestamp,
                                        $1,
                                        $2,
                                        (SELECT  person_id
                                        FROM    public.login_info
                                        WHERE   username = $3)) RETURNING id`,
            values: [applicationDTO.problemDescription, applicationDTO.categoryId, applicationDTO.username],
        };

        

        try {
            
            const connectionCheck = this._checkClientConnection();

            let applicationRegistrationDTO;
            let errorChecker = false;
            if(!connectionCheck) {
                return null;
            }

            if(userDTO.roleID === null || userDTO.roleID !== repairmentServiceSystemRoles.User) {
                applicationRegistrationDTO = new ApplicationRegistrationDTO(0, applicationRegistrationErrorEnum.InvalidRole);
                errorChecker = true;
            }

            await this._runQuery('BEGIN');
            const categoryCheckQueryResult = await this._runQuery(categoryCheckQuery);
            const applicationDuplicateCheckResult = await this._runQuery(applicationDuplicateCheck);

            if(applicationDuplicateCheckResult.rowCount > 0) {
                applicationRegistrationDTO = new ApplicationRegistrationDTO(applicationDuplicateCheckResult.rows[0].id, 
                    applicationRegistrationErrorEnum.AlreadyExistApplication);
                errorChecker = true;
            }
            if(categoryCheckQueryResult.rowCount <= 0) {
                applicationRegistrationDTO = new ApplicationRegistrationDTO(0, applicationRegistrationErrorEnum.InvalidCategoryId);
                errorChecker = true;
            }
            if(errorChecker === false) {
                const newApplicationResult = await this._runQuery(newApplicationQuery);
                const recentlySubmitedApplicationId = newApplicationResult.rows[0].id;
                applicationRegistrationDTO = new ApplicationRegistrationDTO(recentlySubmitedApplicationId, applicationRegistrationErrorEnum.OK);
            }
            await this._runQuery('COMMIT');

            

            return applicationRegistrationDTO;


        } catch (error) {
            //this.logger.logException(error);
            console.log(error);
            return null;
        }
    }


    async getApplicationsListByWorker(applicationsFilterParamsDTO) {
        try {
            
            const applicationsFilteringRes = await this._getFilteredApplicationsList(applicationsFilterParamsDTO);

            if (applicationsFilteringRes.rowCount === 0) {
                return new ApplicationsFilteredListDTO([]);
            }
            let returnedList;

            let applicationList = [];

            for (let i = 0; i < applicationsFilteringRes.rowCount; i++) {
                applicationList[i] = {
                    applicationId: applicationsFilteringRes.rows[i].applicationid,
                    firstName: applicationsFilteringRes.rows[i].firstname,
                    lastName: applicationsFilteringRes.rows[i].lastname,
                    dateOfRegistration: applicationsFilteringRes.rows[i].dateofregistration,
                    timeOfRegistration: applicationsFilteringRes.rows[i].timeofregistration,
                };
                
            }
            //returnedList = [...applicationList];
            return new ApplicationsFilteredListDTO(applicationList);

        } catch (error) {
            //this.logger.logException();
            console.log(error)
            return null;
        }
    }



    async _getFilteredApplicationsList(applicationsFilterParamsDTO) {
        try {
            
        
            let applicationId = applicationsFilterParamsDTO.applicationId;
            let categoryId = applicationsFilterParamsDTO.categoryId;
            let firstname = applicationsFilterParamsDTO.firstname;
            let lastname = applicationsFilterParamsDTO.lastname;
            let dateOfRegistrationFrom = applicationsFilterParamsDTO.dateOfRegistrationFrom;
            let dateOfRegistrationTo = applicationsFilterParamsDTO.dateOfRegistrationTo;
            let suggestedPriceFrom = applicationsFilterParamsDTO.suggestedPriceFrom;
            let suggestedPriceTo = applicationsFilterParamsDTO.suggestedPriceTo;
            let reparationStatusId = applicationsFilterParamsDTO.reparationStatusId;

            if( applicationId === filtersEmptyParameersEnum.ApplicationID) {
                applicationId = -1;
            }
            if(categoryId === filtersEmptyParameersEnum.CategoryID) {
                categoryId = -1;
            }
            if(firstname === filtersEmptyParameersEnum.Name) {
                firstname = '';
            }
            if(lastname === filtersEmptyParameersEnum.Name) {
                lastname = '';
            }
            if(suggestedPriceFrom === filtersEmptyParameersEnum.Price) {
                suggestedPriceFrom = -1;
            }
            if(suggestedPriceTo === filtersEmptyParameersEnum.Price) {
                suggestedPriceTo = -1;
            }
            if(reparationStatusId === filtersEmptyParameersEnum.ReparationStatusId) {
                reparationStatusId = -1;
            }

            const filteringQueryContent = {
                text: `SELECT
                application.id as applicationId,
                person.first_name as firstName,
                person.last_name as lastName,
                application.date_of_registration::DATE as dateOfRegistration, 
                application.date_of_registration::TIME as timeOfRegistration
              FROM
                public.application
                LEFT JOIN public.person ON (application.person_id = person.id)
                LEFT JOIN public.login_info ON (person.id = login_info.person_id)
                LEFT JOIN public.category_relation ON (application.category_relation_id = category_relation.id)
                LEFT JOIN public.category ON (category_relation.category_id = category.id)
                LEFT JOIN public.application_reparation_price ON (application.id = application_reparation_price.application_id)
                LEFT JOIN public.application_reparation_status ON (application.id = application_reparation_status.application_id)
                LEFT JOIN public.reparation_status ON (application_reparation_status.reparation_status_id = reparation_status.id)
               
              WHERE
                    CASE WHEN (($1 = -1) IS NOT TRUE) THEN
                                      application.id = $1
                                    ELSE
                                      TRUE
                                    END
                                    AND
                  CASE WHEN (($2 = -1) IS NOT TRUE) THEN
                                      category.id = $2
                                    ELSE
                                      TRUE
                                    END
                                    AND
                  CASE WHEN (($3 = '') IS NOT TRUE) THEN
                                      person.first_name = $3
                                    ELSE
                                      TRUE
                                    END
                                    AND
                  CASE WHEN (($4 = '') IS NOT TRUE) THEN
                                      person.last_name = $4
                                    ELSE
                                      TRUE
                                    END
                                    AND
                  CASE WHEN (($5 = '0001-01-01') IS NOT TRUE) THEN
                                      application.date_of_registration >= DATE($5)
                                    ELSE
                                      TRUE
                                    END
                                    AND
                  CASE WHEN (($6 = '0001-01-01') IS NOT TRUE) THEN
                                      application.date_of_registration <= DATE($6)
                                    ELSE
                                      TRUE
                                    END
                                    AND
                  CASE WHEN (($7 = -1) IS NOT TRUE) THEN
                                      application_reparation_price.suggested_price_by_worker >= $7
                                    ELSE
                                      TRUE
                                    END
                                    AND
                  CASE WHEN (($8 = -1) IS NOT TRUE) THEN
                                      application_reparation_price.suggested_price_by_worker <= $8
                                    ELSE
                                      TRUE
                                    END
                                    AND
                  CASE WHEN (($9 = -1) IS NOT TRUE) THEN
                                      application_reparation_status.reparation_status_id = $9
                                    ELSE
                                      TRUE
                                    END
                  AND person.role_id = $10
              ORDER BY date_of_registration DESC`,
              values: [applicationId, categoryId, firstname, lastname, dateOfRegistrationFrom, dateOfRegistrationTo, 
                suggestedPriceFrom, suggestedPriceTo, reparationStatusId, repairmentServiceSystemRoles.User],
            };

            const clientConnection = await this._checkClientConnection();

            if(!clientConnection) {
                return null;
            }

            await this._runQuery('BEGIN');

            const applications = await this._runQuery(filteringQueryContent);

            await this._runQuery('COMMIT');

            return applications;
        } catch (error) {
            console.log(error);
            return null;
        }

    }

    async _runQuery(queryContent) {
        try {
            const results = await this.client.query(queryContent);
            return results;
        } catch (error) {
            const connection = await this._checkClientConnection();
            if(connection) {
                await this.client.query('ROLLBACK');
            }
            throw error;
        }
    }

   

    // async _getPersonId(username) {
    //    const getPersonIdQuery = {
    //        text: ``
    //    }
    // }

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