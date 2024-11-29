import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { refreshToken } from "../middleware/auth.js"

import Login from "../models/login.models.js"
import User from "../models/user.models.js"

const app = express();
const router = express.Router();

dotenv.config();

const accessToken_expiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRE
const refreshToken_expiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRE;

// const accessToken_expires_in = "1800 seconds"
const accessToken_expires_in = "24 hours"
const refreshToken_expires_in = "24 hours"

// Generate Token 
router.post("/generate", cors(), async (req, res) => {
    try{
        // Validate User Here - if a user exists in the db with the given credentials
        console.log(req.body.email);
    
        const userExist = await User.findOne({ email: req.body.email });
        const userAlreadyLogged = await Login.findOne({ email: req.body.email });
    
        if (userExist && userAlreadyLogged) {
            // Then generate JWT Token
            let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
            // const salt = await bcrypt.genSalt(10);
            // hashedPassword = await bcrypt.hash(req.body.password, salt);
    
            const validPassword = await bcrypt.compare(
                req.body.password,
                userExist.password
            );
        
            if (!validPassword)
                return res
                    .status(400)
                    .send({ status: 400, message: "Invalid password." });
    
            let data = {
                time: Date(),
                user_id: userExist.user_id,
                username: userExist.username,
                email: req.body.email,
                password: userExist.password,
                user_role: userExist.user_role,
                expires_in: accessToken_expiresIn,
            };
            
            const token = jwt.sign(data, jwtSecretKey, {expiresIn: accessToken_expiresIn});
            
            // Format the token as a Bearer token
            const bearerToken = `Bearer ${token}`;
            
            // Prepare the response data with additional details
            let response = {
                user_id: userExist.user_id,
                username: userExist.username,
                user_role: userExist.user_role,
                token_type: userExist.token_type,
                token: bearerToken,
                expiresIn_in: accessToken_expires_in, 
            };
    
            //res.send(bearerToken);
            // return res.json({ token: bearerToken });
            return res.json(response);
        
          } else if (!userAlreadyLogged) {
                return res
                    .status(400)
                    .send({ status: 400, message: "User not logged in." });
          } else {
                return res
                    .status(400)
                    .send({ status: 400, message: "User not found." });
          }
    } catch (err) {
        return res.status(402).send({ status: 402, message: err.message });
    }  
});
  
// Refresh token
router.post("/refresh", cors(), async (req, res) => {
try {
    const { email, refresh_token } = req.body;
    const userExist = await User.findOne({ email: email });

    const isValid = refreshToken(email, refresh_token);
    if (!isValid) {
        return res.status(401).json({
            status: 401,
            error: "Invalid refresh token.",
        });
        // TODO ----- Add code here to auto logout user
    }

    let jwtSecretKey = process.env.JWT_SECRET_KEY;

    let data = {
        time: Date(),
        user_id: userExist.user_id,
        username: userExist.username,
        email: req.body.email,
        password: userExist.password,
        user_role: userExist.user_role,
        expires_in: accessToken_expires_in,
    };
    
    const access_token = jwt.sign(data, jwtSecretKey, { expiresIn: accessToken_expiresIn });
    
    // Prepare the response data with additional details
    let response = {
        user_id: userExist.user_id,
        username: userExist.username,
        user_role: userExist.user_role,
        token_type: "Bearer",
        access_token: access_token,
        expires_in: accessToken_expires_in, 
    };

    return res.status(200).json({ status: 200, response });
} catch (err) {
    return res.status(403).send({ status: 403, message: err.message });
}
});

export default router;