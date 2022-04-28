'use strict';

const ApplicationDTO = require('../DTOs/ApplicationDTO');
const SignupDTO = require('../DTOs/SignupDTO');
const RepairmentServiceDAO = require('../integration/RepairmentServiceDAO');



class Controller {
    constructor() {
        this.repairmentServiceDAO = new RepairmentServiceDAO();
    }

    static async createControllerInstance() {
        const controller = new Controller();
        await controller.repairmentServiceDAO.establishTheConnection();
        return controller;
    }

    async loginUser(username, password) {
        const userDTO = await this.repairmentServiceDAO.loginUser(username, password);
        return userDTO;
    }

    async signupUser(firstname, lastname, personalNumber, email, username, password, mobileNumber) {
        const signupDTO = new SignupDTO(firstname, lastname, personalNumber, email, username, password, mobileNumber);
        const userDTO = this.repairmentServiceDAO.signupUser(signupDTO);
        return userDTO;
    }

    async getCategories() {
        const categoriesList = this.repairmentServiceDAO.getCategories();
        return categoriesList;
    }

    async registerApplication(userDTO, categoryRelationId, problemDescription) {
        const applicationDTO = new ApplicationDTO(userDTO.username, categoryRelationId, problemDescription);
        const applicationRegistrationDTO = await this.repairmentServiceDAO.registerNewApplication(userDTO, applicationDTO);
        return applicationRegistrationDTO;
    }
}


module.exports = Controller;