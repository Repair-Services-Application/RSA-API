'use strict';

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
}


module.exports = Controller;