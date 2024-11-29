process.env.NODE_ENV = 'test';

import * as chai from 'chai'; // Import all from 'chai' as a named import
import {default as chaiHttp, request} from "chai-http"; // If you need to access `request`

import server from '../server.js';  // Import the Express app

const { expect } = chai;
const should = chai.should();

chai.use(chaiHttp); // Tell Chai to use chai-http plugin

const baseURL = "/book-hive/api";  // Base URL for the API endpoints

// Cleanup actions before and after the tests



// Using BDD-style should assertions
describe('GET /auth/getAll', () => {

    it('should get all logged users', (done) => {
        request.execute(server)
            .get(`${baseURL}/auth/getAll`)
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

//  Using BDD-style expect assertions
describe('POST /auth/signup', () => {
    it(('should sign up a new user'), (done) => {

        const newUser = {
            username: 'testuser1',
            email: 'testuser1@gmail.com',
            password: 'password1111',
            contact_no: '0716455451',
            linked_discord_id: 'discord1111',
        };

        request.execute(server)
            .post(`${baseURL}/auth/signup`)
            .send(newUser)
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    // Assert that the response status is 201
                    expect(res).to.have.status(201);

                    // Assert that the response message indicates success
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('status').that.equals(201);
                    expect(res.body).to.have.property('message').that.equals('User signed up successfully!');

                    // Indicate that the test has finished
                    done();
                }
            })
    });

    it(('should return an error if an invalid email encountered'), (done) => {

        const existingUser = {
            username: 'testuser2',
            email: 'testuser2@example.com',
            password: 'password2222',
            contact_no: '0716455452',
            linked_discord_id: 'discord2222',
        };

        request.execute(server)
            .post(`${baseURL}/auth/signup`)
            .send(existingUser)
            .end((err, res) => {
                if (err) return done(err);

                // Assert that the response status is 400
                expect(res).to.have.status(400);

                // Assert that the response message indicates success
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status').that.equals(400);
                expect(res.body).to.have.property('message').that.equals('Invalid email address.');

                // Indicate that the test has finished
                done();
            })
    });
    
    it(('should return an error if an invalid contact no encountered'), (done) => {

        const existingUser = {
            username: 'testuser3',
            email: 'testuser3@gmail.com',
            password: 'password3333',
            contact_no: '01234',
            linked_discord_id: 'discord3333',
        };

        request.execute(server)
            .post(`${baseURL}/auth/signup`)
            .send(existingUser)
            .end((err, res) => {
                if (err) return done(err);

                // Assert that the response status is 400
                expect(res).to.have.status(400);

                // Assert that the response message indicates success
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status').that.equals(400);
                expect(res.body).to.have.property('message').that.equals('Invalid contact number.');

                // Indicate that the test has finished
                done();
            })
    });
    
    it(('should return an error if the email already exists'), (done) => {

        const existingUser = {
            username: 'testuser4',
            email: 'testuser1@gmail.com',
            password: 'password4444',
            contact_no: '0716455454',
            linked_discord_id: 'discord4444',
        };

        request.execute(server)
            .post(`${baseURL}/auth/signup`)
            .send(existingUser)
            .end((err, res) => {
                if (err) return done(err);

                // Assert that the response status is 400
                expect(res).to.have.status(400);

                // Assert that the response message indicates success
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status').that.equals(400);
                expect(res.body).to.have.property('message').that.equals('A user with the same email address already exists.');

                // Indicate that the test has finished
                done();
            })
    });

    it(('should return an error if contact number already exists'), (done) => {

        const existingContactUser = {
            username: 'testuser5',
            email: 'testuser5@gmail.com',
            password: 'password5555',
            contact_no: '0716455451',
            linked_discord_id: 'discord5555',
        };

        request.execute(server)
            .post(`${baseURL}/auth/signup`)
            .send(existingContactUser)
            .end((err, res) => {
                if(err) return done(err);
                
                expect(res).to.have.status(400);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status').that.equals(400);
                expect(res.body).to.have.property('message').that.equals('A user with the same contact number already exists.')

                done();
            })
    })
})