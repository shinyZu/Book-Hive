process.env.NODE_ENV = 'test';

import * as chai from 'chai'; // Import all from 'chai' as a named import
import {default as chaiHttp, request} from "chai-http"; // If you need to access `request`

import server from '../server.js';  // Import your Express app

const { expect } = chai;
const should = chai.should();

chai.use(chaiHttp); // Tell Chai to use chai-http plugin

const baseURL = "/book-hive/api";  // Base URL for the API endpoints

describe('GET /users', () => {

    it('should test GET /users/getAll', (done) => {
        request.execute(server)
            .get(`${baseURL}/users/getAll`)
            .end((err, res) => {
                if (err) {
                    done(err);  // In case of error, pass it to the done callback
                } else {
                    res.should.have.status(200);  // Assert that the response status is 200
                    done();  // Indicate that the test has finished
                }
            });
    });

});

/* 
    end() callback: This is where you define the assertions (such as checking the response status). 
    Once the test is complete, call done() to tell Mocha the test is finished.
*/
