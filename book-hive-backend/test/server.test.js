process.env.NODE_ENV = 'test';

import * as chai from "chai"; // Import all from 'chai' as a named import
import {default as chaiHttp, request} from "chai-http";  // If you need to access `request`

import server from "../server.js";  // Import Express app

const { expect } = chai;
const should = chai.should();

chai.use(chaiHttp);  // Tell Chai to use chai-http plugin

const baseURL = "/book-hive/api";

/* describe('/First Test Collection', () => {
    
    it('should test two values', () => {
        let expectedVal = 10;
        let actualVal = 10;

        expect(actualVal).to.be.equal(expectedVal);
    })
}) */

describe('GET /server', () => {
    
    it('should test default API in server', (done) => {
        request.execute(server)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })

    it('should test hello API in server', (done) => {
        request.execute(server)
            .get(`${baseURL}/hello`)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})

/* 

    end() callback: 
        - This is where you define the assertions (such as checking the response status). 
        - Once the test is complete, call done() to tell Mocha the test is finished.

    chai-http
        - a plugin for chai assertion library
        - allows to http integration testing with chai assertions(statement/conditions)
        - can be used to connect with http and routes and get a repsonse
        - tests the req and the res

    Behavior-driven development (BDD) 
        - is a software development methodology that uses a specific syntax and domain-specific language to write tests that describe how an application should behave. 
        - BDD is an Agile practice that emphasizes collaboration between developers, testers, and business stakeholders.
        - comes in two flavors: expect and should. 
            - Both use the same chainable language to construct assertions, but they differ in the way an assertion is initially constructed.
            - In both scenarios, you chain together natural language assertions.

    Hook
        - used to set up preconditions and clean up after the tests.
        - before(), after(), beforeEach(), and afterEach()
*/


