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
const ApplicationDetailsDTO = require("../DTOs/ApplicationDetailsDTO");
const PersonalApplicationsListDTO = require("../DTOs/PersonalApplicationsListDTO");
const applicationErrorCodesEnum = require("../utilities/applicationErrorCodesEnum");
const Logger = require("../utilities/Logger");
const ReparationStatusDTO = require("../DTOs/ReparationStatusDTO");

class RepairmentServiceDAO {
    
    /**
     * The responsible class for the database managing which ranges between 
     * Selecting, Inserting and Updating data from and to the database.
     */
    constructor() {

        /**
         * Creates an instance of the {RepairmentServiceDAO} object with the needed credentials to connect to the database. 
         * To disable the automatic date parsing in the database by node-postgres, the options are: idOfDateObject, 
         * defaultRawParser and types.setTypeParser
         */
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

        this.logger = new Logger('DatabaseHandlerLogger');
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
                this.logger.logCurrentException(error);
            });
            await this.client.connect();
        } catch (error) {
            this.logger.logCurrentException(error);
        }
        
    }

    /**
     * Check of the user's entered username and password are correct or not.
     * @param {string} username The used username for the login process, and even the user's profile name. 
     * @param {string} password The used password for the login process.
     * @returns {UserDTO | null} If the username and passowrd are correct, a {UserDTO} object is returned including the username, 
     *                              roleID and error/status code.
     *                           If the login has failed, it returns null.
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
            this.logger.logCurrentException(error);
            return null;
        }
    }

    /**
     * Use the entered new user's data, check if there is already a user using the same email adress, username and personal number, 
     * and return the UserDTO with specific errorCode status.
     * If there is no other users use the same data, The methods commits the new user registration entries to the database. 
     * @param {SignupDTO} signupDTO contains the signup entered data.
     * @returns {UserDTO | null} UserDTO when the signup process has succeseeded,
     *                           null if there is no connection to the database, or some other error occurs. 
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
            this.logger.logCurrentException(error);
            return null;
        }
        
    }

   /**
    * Get all the categories with the specified Parent category id (rootCategoryId). For root cateogries, the parentCategoryId is 0. 
    * @param {number} rootCategoryId The root category id of the specified cateogries
    * @returns {CategoryDTO[] | null} a list of CategoryDTO if the categories have returned successfully,
    *                                 null  if there is no connection to the database, or some other error occurs.  
    */
    async getCategories(rootCategoryId) {
        
        const getCategoriesQuery = {
            text: ` SELECT  category_relation.category_id,
                            category.description,
                            category_relation.parent_category_id
                    FROM    public.category_relation category_relation
                            INNER JOIN public.category category ON (category_relation.category_id = category.id)
                    WHERE   parent_category_id = $1`,
            values: [rootCategoryId],
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
            this.logger.logCurrentException(error);
            return null;
        }
    }

    async getReparationStatuses() {
        
        const getReparationStatusQuery = {
            text: ` SELECT  public.reparation_status.id as status_id,
                            public.reparation_status.status_description
                    FROM    public.reparation_status`,
            values: [],
        };

        try {
            let returnedList = [];
            const clientConnection = this._checkClientConnection();

            if(clientConnection === null) {
                return null;
            }

            await this._runQuery('BEGIN');
            const reparationStatusResult = await this._runQuery(getReparationStatusQuery);
            if(reparationStatusResult.rowCount <= 0) {
                returnedList = [];
            }
            else{
                for (let i = 0; i < reparationStatusResult.rowCount; i++) {

                    const currentReparationStatus = new ReparationStatusDTO(reparationStatusResult.rows[i].status_id, 
                        reparationStatusResult.rows[i].status_description);
                    returnedList[i] = currentReparationStatus;
                    }
            }

            await this._runQuery('COMMIT');

            return returnedList;
            

        } catch (error) {
            this.logger.logCurrentException(error);
            return null;
        }
    }

    /**
     * Register a new application for the logged in user (only normal users/customers are allowed to register applications)
     * @param {UserDTO} userDTO The logged in userDTO including data about username, roleID and errorCode. 
     * @param {NewApplicationDTO} NewApplicationDTO The new application data to be used for application registration.
     * @returns {ApplicationRegistrationDTO | null} The ApplicationRegistrationDTO object contains the application Id, 
     *                                              Null if the connection is lost to the database, or some other error occurs.
     */
    async registerNewApplication(userDTO, NewApplicationDTO) {

        const categoryCheckQuery = {
            text: `SELECT 	* 
            FROM 	public.category_relation
            WHERE 	category_id = $1`,
            values: [NewApplicationDTO.categoryId],
        };

        const applicationDuplicateCheck = {
            text: `SELECT     id
            FROM     public.application
            WHERE    problem_description = $1 and
                     category_relation_id = $2 and 
					 person_id = (SELECT  person_id
                                        FROM    public.login_info
                                        WHERE   username = $3)`,
            values: [NewApplicationDTO.problemDescription, NewApplicationDTO.categoryId, NewApplicationDTO.username],
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
            values: [NewApplicationDTO.problemDescription, NewApplicationDTO.categoryId, NewApplicationDTO.username],
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
            this.logger.logCurrentException(error);
            return null;
        }
    }

    /**
     * /**
     * Get the applications by worker using filtering parameters included in the {ApplicationsFilterParamsDTO} object.
     * @param {ApplicationsFilterParamsDTO} applicationsFilterParamsDTO The filtering paramteres DTO.
     * @returns {ApplicationsFilteredListDTO | null} The ApplicationsFilteredListDTO object contains the A list of the filtered applications, 
     *                                               Null if the connection is lost to the database, or some other error occurs.
     */
    async getApplicationsListByWorker(applicationsFilterParamsDTO) {
        try {
            
            const applicationsFilteringRes = await this._getFilteredApplicationsList(applicationsFilterParamsDTO);

            if (applicationsFilteringRes.rowCount === 0) {
                return new ApplicationsFilteredListDTO([]);
            }

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
            return new ApplicationsFilteredListDTO(applicationList);

        } catch (error) {
            this.logger.logCurrentException();
            return null;
        }
    }

    /**
     * Get the application details according to the loggedin UserDTO's username and application Id if the loggedin user is normal user, 
     * or using only the application Id, if the logged in user is either worker or administrator.
     * @param {number} applicationId The chosen application's id to be shown.
     * @param {UserDTO} userDTO the logged in userDTO
     * @returns {ApplicationDetailsDTO | null} ApplicationDetailsDTO if the user is eligible to show the application, 
     *                                          and the application could be returned successfully.
     *                                         null if the connection to the database lost, or some other error occured.
     */
    async returnApplicationDetails(applicationId, userDTO) {
        try {

            let getApplicationDetailsQueryContent;
            if(userDTO.roleID === repairmentServiceSystemRoles.Administrator || userDTO.roleID === repairmentServiceSystemRoles.Worker) {
                getApplicationDetailsQueryContent = {
                    text: `SELECT 	public.application.id AS application_id,
                                    public.person.first_name,
                                    public.person.last_name,
                                    public.category.description AS category_description,
                                    public.category.id AS category_id,
                                    public.application.problem_description,
                                    public.application.date_of_registration::DATE as date_of_registration,
                                    public.application.date_of_registration::TIME as time_of_registration,
                                    COALESCE (public.application_reparation_price.suggested_price_by_worker, 0) AS suggested_price_by_worker,
                                    COALESCE (public.application_reparation_price.approval_by_user, 'Undefined') AS approval_by_user,
                                    COALESCE (public.reparation_status.id, 0) AS reparation_status_id,
                                    COALESCE (public.reparation_status.status_description, 'Undefined') AS reparation_status_description
                
                            FROM	public.application
                                    LEFT OUTER JOIN public.person ON (public.application.person_id = public.person.id)
                                    LEFT OUTER JOIN public.category_relation ON (public.application.category_relation_id = public.category_relation.id)
                                    LEFT OUTER JOIN public.category ON (public.category_relation.category_id = public.category.id)
                                    LEFT OUTER JOIN public.application_reparation_price ON (public.application.id = public.application_reparation_price.application_id)
                                    LEFT OUTER JOIN public.application_reparation_status ON (public.application.id = public.application_reparation_status.application_id)
                                    LEFT OUTER JOIN public.reparation_status ON (public.application_reparation_status.reparation_status_id = public.reparation_status.id)
                                    INNER JOIN public.login_info ON (public.person.id = public.login_info.person_id)
                            WHERE	application.id = $1`,
                    values: [applicationId],
                };
            }
            else {
                getApplicationDetailsQueryContent = {
                    text: `SELECT 	public.application.id AS application_id,
                                    public.person.first_name,
                                    public.person.last_name,
                                    public.category.description AS category_description,
                                    public.category.id AS category_id,
                                    public.application.problem_description,
                                    public.application.date_of_registration::DATE as date_of_registration,
                                    public.application.date_of_registration::TIME as time_of_registration,
                                    COALESCE (public.application_reparation_price.suggested_price_by_worker, 0) AS suggested_price_by_worker,
                                    COALESCE (public.application_reparation_price.approval_by_user, 'Undefined') AS approval_by_user,
                                    COALESCE (public.reparation_status.id, 0) AS reparation_status_id,
                                    COALESCE (public.reparation_status.status_description, 'Undefined') AS reparation_status_description
                
                            FROM	public.application
                                    LEFT OUTER JOIN public.person ON (public.application.person_id = public.person.id)
                                    LEFT OUTER JOIN public.category_relation ON (public.application.category_relation_id = public.category_relation.id)
                                    LEFT OUTER JOIN public.category ON (public.category_relation.category_id = public.category.id)
                                    LEFT OUTER JOIN public.application_reparation_price ON (public.application.id = public.application_reparation_price.application_id)
                                    LEFT OUTER JOIN public.application_reparation_status ON (public.application.id = public.application_reparation_status.application_id)
                                    LEFT OUTER JOIN public.reparation_status ON (public.application_reparation_status.reparation_status_id = public.reparation_status.id)
                                    INNER JOIN public.login_info ON (public.person.id = public.login_info.person_id)
                            WHERE	application.id = $1 and
                                    login_info.username = $2`,
                    values: [applicationId, userDTO.username],
                };
            }
            
            const clientConnection = this._checkClientConnection();

            if(!clientConnection) {
                return null;
            }

            let applicationDetailsDTO;

            await this._runQuery('BEGIN');

            const getApplicationResult = await this._runQuery(getApplicationDetailsQueryContent);
            if(getApplicationResult.rowCount <= 0) {

                applicationDetailsDTO = {
                    applicationId: applicationId, 
                    firstName: 'DUMMY', 
                    lastName: 'DUMMY', 
                    categoryDescription:'DUMMY', 
                    categoryId: 0, 
                    problemDescription: 'DUMMY', 
                    dateOfRegistration: '0001-01-01', 
                    timeOfRegistration: '00:00:00', 
                    suggestedPriceByWorker: 0, 
                    priceApprovalByUser: 'Undefined', 
                    reparationStatusId: 0,
                    reparationStatusDescription: 'DUMMY', 
                    errorCode: applicationErrorCodesEnum.InvalidID,
                };
            }
            else {
                applicationDetailsDTO = {
                    applicationId: getApplicationResult.rows[0].application_id, 
                    firstName: getApplicationResult.rows[0].first_name, 
                    lastName: getApplicationResult.rows[0].last_name, 
                    categoryDescription: getApplicationResult.rows[0].category_description, 
                    categoryId: getApplicationResult.rows[0].category_id, 
                    problemDescription: getApplicationResult.rows[0].problem_description, 
                    dateOfRegistration: getApplicationResult.rows[0].date_of_registration, 
                    timeOfRegistration: getApplicationResult.rows[0].time_of_registration, 
                    suggestedPriceByWorker: getApplicationResult.rows[0].suggested_price_by_worker, 
                    priceApprovalByUser: getApplicationResult.rows[0].approval_by_user, 
                    reparationStatusId: getApplicationResult.rows[0].reparation_status_id,
                    reparationStatusDescription: getApplicationResult.rows[0].reparation_status_description, 
                    errorCode: applicationErrorCodesEnum.OK,
                };
            }

            return new ApplicationDetailsDTO(applicationDetailsDTO);


        } catch (error) {
            this.logger.logCurrentException();
            return null;
        }
    }

    /**
     * Returns the logged in user's submmitted applications using the username in the userDTO, 
     * this endpoint is only accessible by normal users (no worker nor administrator).
     * @param {UserDTO} userDTO the logged in user's userDTO including the username and roleId.
     * @returns {PersonalApplicationsListDTO | null} return a object {PersonalApplicationsListDTO} 
     *                                               including a list of the returned applications.
     *                                               null if the connection to the database is lost, or some other error occured.
     */
    async returnPersonalApplicationsListDTO(userDTO) {
        try {
            
            const getPersonalApplicationsListQuery = {
                text: `SELECT   public.application.id AS application_id,
                                public.category.description AS category_description,
                                public.category.id AS category_id,
                                public.application.date_of_registration::DATE AS date_of_registration,
                                public.application.date_of_registration::TIME AS time_of_registration
                        FROM    public.application
                                LEFT JOIN public.person ON (application.person_id = person.id)
                                LEFT JOIN public.category_relation ON (application.category_relation_id = category_relation.id)
                                LEFT JOIN public.category ON (category_relation.category_id = category.id)
                                LEFT JOIN public.application_reparation_price ON (application.id = application_reparation_price.application_id)
                                LEFT JOIN public.application_reparation_status ON (application.id = application_reparation_status.application_id)
                                LEFT JOIN public.reparation_status ON (application_reparation_status.reparation_status_id = reparation_status.id)
                        WHERE   application.person_id= (SELECT     person_id
                                                        FROM       login_info
                                                        WHERE      username = $1)`,
                values: [userDTO.username],
            };


            const clientConnection = this._checkClientConnection();

            if(!clientConnection) {
                return null;
            }

            await this._runQuery('BEGIN');
            const getPersonalApplicationsListDTO = await this._runQuery(getPersonalApplicationsListQuery);
            
            if(getPersonalApplicationsListDTO.rowCount <= 0) {
                return new PersonalApplicationsListDTO([])
            }

            let personalApplicationsList = [];

            for (let i = 0; i < getPersonalApplicationsListDTO.rowCount; i++) {
                personalApplicationsList[i] = {
                    applicationId: getPersonalApplicationsListDTO.rows[i].application_id,
                    categoryDescription: getPersonalApplicationsListDTO.rows[i].category_description,
                    categoryId: getPersonalApplicationsListDTO.rows[i].category_id,
                    dateOfRegistration: getPersonalApplicationsListDTO.rows[i].date_of_registration,
                    timeOfRegistration: getPersonalApplicationsListDTO.rows[i].time_of_registration,
                };
                
            }
            return new PersonalApplicationsListDTO(personalApplicationsList);

        } catch (error) {
            this.logger.logCurrentException();
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
            this.logger.logCurrentException();
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