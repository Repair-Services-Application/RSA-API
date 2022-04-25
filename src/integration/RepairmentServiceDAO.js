'use strict';

const { Client, types } = require("pg");

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
            statement_timeout: 3000,
            query_timeout: 3000,
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
            console.log('A connection has been made to the db.');
        } catch (error) {
            //this.logger.logException(error);
            console.log(error);
        }
        

        
    }

}


module.exports = RepairmentServiceDAO;