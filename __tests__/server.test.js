const request = require('supertest');
const server = require('../src/server');

// afterAll(async (done) => {
//     await server.close();
//     done();
// });

describe('home route test', () => {
    test('get home page GET /', async () => {
        const response = await request(server).get('/');
        expect(response.status).toEqual(200);
        expect(response.text).toEqual('Welcome to the Repairment service application API');
    })
});