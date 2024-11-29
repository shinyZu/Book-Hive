process.env.NODE_ENV = 'test';

import * as chai from 'chai'; 
import {default as chaiHttp, request} from "chai-http";
import bcrypt from "bcryptjs";

import server from '../server.js'; 
import { generateToken } from "../routes/auth.js"

const { expect } = chai;
const should = chai.should();

chai.use(chaiHttp);

const baseURL = "/book-hive/api"; 

describe('GET /users/getAll', () => {

    let adminToken;
    let hashedPassword;
    let salt;

    before(async () => {

        // Hash the password
        salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash('admin20000', salt);

        // Define admin user details
        const adminDetails = {
            user_id: 0,
            username: 'admin2',
            email: 'admin2@gmail.com',
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

        adminToken = tokenData.access_token; 
    });

    it('should get all users only by admins', (done) => {
        request.execute(server)
            .get(`${baseURL}/users/getAll`)
            .set('Authorization', `Bearer ${adminToken}`)
            .end((err, res) => {
                if (err) {
                    done(err); 
                } else {
                    res.should.have.status(200); 
                    done();
                }
            });
    });

});