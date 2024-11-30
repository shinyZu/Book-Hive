process.env.NODE_ENV = 'test';

import * as chai from 'chai'; 
import {default as chaiHttp, request} from "chai-http";

import server from '../server.js'; 
import User from "../models/user.models.js" 

import bcrypt from "bcryptjs";
import { generateToken } from "../routes/auth.js"

const { expect } = chai;
const should = chai.should();

chai.use(chaiHttp);

const baseURL = "/book-hive/api";  

// Using BDD-style should assertions
describe('GET /auth/getAll', () => {

    let adminToken;
    let hashedPassword;
    let salt;

    before(async () => {

        // Hash the password
        salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash('admin10000', salt);

        // Define admin user details
        const adminDetails = {
            user_id: 0,
            username: 'admin1',
            email: 'admin1@gmail.com',
            hashedPassword: hashedPassword,
            user_role: 'admin',
        };

        // Generate admin token
        const tokenData = await generateToken(
            adminDetails.user_id,
            adminDetails.username,
            adminDetails.email,
            adminDetails.hashedPassword,
            adminDetails.user_role
        );

        if (!tokenData || !tokenData.access_token) {
            throw new Error('Token generation failed or returned an invalid structure.');
        }

        adminToken = tokenData.access_token; // Extract the access token
    });

    it('should get all logged users only by admin', (done) => {
        request.execute(server)
            .get(`${baseURL}/auth/getAll`)
            .set('Authorization', `Bearer ${adminToken}`) // Add the token to the header
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

// Using BDD-style expect assertions
describe('POST /auth/signup', () => {
    it(('should sign up a new user'), (done) => {

        const newUser = {
            user_id: 1,
            first_name:'Test',
            last_name:'User1',
            username: 'testuser1',
            email: 'testuser1@gmail.com',
            password: 'password1111',
            contact_no: '0716455451',
            user_role: 'reader',
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

                    // Assert that the response contains the token data
                    expect(res.body.data).to.have.property('access_token');
                    expect(res.body.data).to.have.property('refresh_token');

                    // Check if the tokens are strings (or add any other validation you need)
                    expect(res.body.data.access_token).to.be.a('string');
                    expect(res.body.data.refresh_token).to.be.a('string');

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
            user_role: 'reader',
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

                // Check if the error message is dynamic based on email validation in model
                let dynamicMessage = JSON.parse(res.text).message;
                expect(res.body).to.have.property('message').that.equals(dynamicMessage);

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
            user_role: 'reader',
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

                let dynamicMessage = JSON.parse(res.text).message;
                expect(res.body).to.have.property('message').that.equals(dynamicMessage);

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
            user_role: 'reader',
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
            user_role: 'reader',
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

// POST Login API
describe('POST /auth/login', () => {

    let newUser;
    let hashedPassword;
    let salt;

    // Create a user before each test
    before(async () => {

        // Add User 2
        // Hash the password
        salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash('password2222', salt);

        // Create a new user object
        newUser = {
            user_id: 2,
            first_name:'Test',
            last_name:'User2',
            username: 'testuser2',
            email: 'testuser2@gmail.com', // Ensure this is unique
            password: hashedPassword,
            contact_no: '0716455452', // Ensure this is unique
            user_role: 'reader',
            linked_discord_id: 'discord2222',
        };

        // Save the user to the User collection (without creating a login record)
        await User.create(newUser);

        // Add User 3
        salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash('password3333', salt);

        // Create a new user object
        newUser = {
            user_id: 3,
            first_name:'Test',
            last_name:'User3',
            username: 'testuser3',
            email: 'testuser3@gmail.com', // Ensure this is unique
            password: hashedPassword,
            contact_no: '0716455453', // Ensure this is unique
            user_role: 'reader',
            linked_discord_id: 'discord3333',
        };

        // Save the user to the User collection (without creating a login record)
        await User.create(newUser);
    });

    it('should log in an existing user and return JWT tokens', (done) => {
        const loginCredentials = {
            email: 'testuser2@gmail.com',
            password: 'password2222',
        };

        request.execute(server)
            .post(`${baseURL}/auth/login`)
            .send(loginCredentials)
            .end((err, res) => {
                if (err) return done(err);

                expect(res).to.have.status(201);

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status').that.equals(201);
                expect(res.body).to.have.property('message').that.equals('User logged in successfully!');
                
                expect(res.body.data).to.have.property('access_token');
                expect(res.body.data).to.have.property('refresh_token');

                expect(res.body.data.access_token).to.be.a('string');
                expect(res.body.data.refresh_token).to.be.a('string');

                done();
            });
    });

    it('should return an error if the user is already logged in', (done) => {
        const user = {
            email: 'testuser1@gmail.com',
            password: 'password1111',
        };

        request.execute(server)
            .post(`${baseURL}/auth/login`)
            .send(user)
            .end((err, res) => {
                if (err) return done(err);

                expect(res).to.have.status(400);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status').that.equals(400);
                expect(res.body).to.have.property('message').that.equals('User already logged in.');
                
                done();
            });
    });

    it('should return an error if no user exist by the email', (done) => {
        request.execute(server)
            .post(`${baseURL}/auth/login`)
            .send({ email: 'nonexistentuser@gmail.com', password: 'password1111' })
            .end((err, res) => {
                if (err) return done(err);
        
                expect(res).to.have.status(400);
                expect(res.body).to.have.property('status').that.equals(400);
                expect(res.body).to.have.property('message').that.equals('Incorrect email address.');
        
                done();
            });
    });

    it('should return an error if the password is incorrect', (done) => {
        request.execute(server)
        .post(`${baseURL}/auth/login`)
          .send({ email: 'testuser3@gmail.com', password: 'wrongpassword' })
          .end((err, res) => {
            if (err) return done(err);

            console.log('\n');
            console.log("Response Status", res.status);
            console.log("Response Body", res.text);
            console.log('\n');
    
            expect(res).to.have.status(400);
            expect(res.body).to.have.property('status').that.equals(400);
            expect(res.body).to.have.property('message').that.equals('Incorrect password.');
    
            done();
        });
    });
});