'use strict';

var chai = require('chai');
var expect = chai.expect;
const RepairmentServiceDAO = require('../../src/integration/RepairmentServiceDAO');
const Logger = require("../../src/utilities/Logger");

let database = null;
let repairmentServiceDAO = null;
let userDTO = null;

beforeAll(async () => {
    const path = require('path');
    const APP_ROOT_DIR = path.join(__dirname, '../../');

    // eslint-disable-next-line no-unused-vars
    const result = require('dotenv-safe').config({
        path: path.join(APP_ROOT_DIR, '.env'),
        example: path.join(APP_ROOT_DIR, '.env.example'),
        allowEmptyValues: true,
    });
    repairmentServiceDAO = new RepairmentServiceDAO();
    this.logger = new Logger('testLogger');
    database = await repairmentServiceDAO.establishTheConnection();

});

beforeEach(async () => {
    await unexpectedJestAwaitFailure();
});

const unexpectedJestAwaitFailure = async () => {
    await sleep(100);
};

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}



describe('test for normalLoginUser', () => {

    test('login normal user Post /user/login', async () => {
        let username = 'User1111';
        let password = 'User1111';
        let roleID = 3;
        let errorCode = 0;
        userDTO = await repairmentServiceDAO.loginUser(username, password);
        expect(userDTO['username']).to.equal(username);
        expect(userDTO['roleID']).to.equal(roleID);
        expect(userDTO['errorCode']).to.equal(errorCode);
    });
});



describe('test for get getApplicationDetails', () => {

    test('test for get getApplicationDetails GET /service/getApplicationDetails', async () => {

        let applicationId = '26';
        let firstname = 'firstTest';
        let lastname = 'lastTest';
        let categoryDescription = 'Electronics';
        let categoryId = 1;
        let problemDescription = 'TV is broken';
        let dateOfRegistration = '2022-05-07';
        let timeOfRegistration = '15:28:15';
        let suggestedPriceByWorker = 0;
        let priceApprovalByUser = 'Undefined';
        let reparationStatusId = 0;
        let reparationStatusDescription = 'Undefined';
        let errorCode = 0;

        const applicationDetails = await repairmentServiceDAO.returnApplicationDetails(applicationId, userDTO);
        expect(applicationDetails['applicationId']).to.equal(applicationId);
        expect(applicationDetails['firstname']).to.equal(firstname);
        expect(applicationDetails['lastname']).to.equal(lastname);
        expect(applicationDetails['categoryDescription']).to.equal(categoryDescription);
        expect(applicationDetails['categoryId']).to.equal(categoryId);
        expect(applicationDetails['problemDescription']).to.equal(problemDescription);
        expect(applicationDetails['dateOfRegistration']).to.equal(dateOfRegistration);
        expect(applicationDetails['timeOfRegistration']).to.equal(timeOfRegistration);
        expect(applicationDetails['suggestedPriceByWorker']).to.equal(suggestedPriceByWorker);
        expect(applicationDetails['priceApprovalByUser']).to.equal(priceApprovalByUser);
        expect(applicationDetails['reparationStatusId']).to.equal(reparationStatusId);
        expect(applicationDetails['reparationStatusDescription']).to.equal(reparationStatusDescription);
        expect(applicationDetails['errorCode']).to.equal(errorCode);
    });
});



describe('test for getCategories', () => {

    test('test for GET /service/getCategories', async () => {
        let rootCategoryId = 0;

        let categoryRelationId = '1';
        let categoryId = 1;
        let categoryDescription = 'Electronics';
        let parentCategoryId = 0;

        let categoryDTO = await repairmentServiceDAO.getCategories(rootCategoryId);
        expect(categoryDTO[0]['categoryRelationId']).to.equal(categoryRelationId);
        expect(categoryDTO[0]['categoryId']).to.equal(categoryId);
        expect(categoryDTO[0]['categoryDescription']).to.equal(categoryDescription);
        expect(categoryDTO[0]['parentCategoryId']).to.equal(parentCategoryId);
    })
});



describe('test for getPersonalApplications', () => {
    test('test for GET /service/getPersonalApplications', async () => {
        let applicationId = '26';
        let categoryDescription = "Electronics";
        let categoryId = 1;
        let dateOfRegistration = "2022-05-07";
        let timeOfRegistration = "15:28:15";

        let personalApplicationsListDTO = await repairmentServiceDAO.returnPersonalApplicationsListDTO(userDTO);
        expect(personalApplicationsListDTO.applications[0]['applicationId']).to.equal(applicationId);
        expect(personalApplicationsListDTO.applications[0]['categoryDescription']).to.equal(categoryDescription);
        expect(personalApplicationsListDTO.applications[0]['categoryId']).to.equal(categoryId);
        expect(personalApplicationsListDTO.applications[0]['dateOfRegistration']).to.equal(dateOfRegistration);
        expect(personalApplicationsListDTO.applications[0]['timeOfRegistration']).to.equal(timeOfRegistration);

    });
});



describe('test for Worker LoginUser', () => {

    test('login Worker user Post /user/login', async () => {
        let username = 'Testo33';
        let password = 'Testoo122';
        let roleId = 2;
        let errorCode = 0;
        userDTO = await repairmentServiceDAO.loginUser(username, password);
        expect(userDTO['username']).to.equal(username);
        expect(userDTO['roleID']).to.equal(roleId);
        expect(userDTO['errorCode']).to.equal(errorCode);
    })
});