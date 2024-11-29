import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { refreshToken } from "../middleware/auth.js"

const app = express();
const router = express.Router();

dotenv.config();

const accessToken_expiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRE
const refreshToken_expiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRE;

const accessToken_expires_in = "1800 seconds"
const refreshToken_expires_in = "24 hours"

// Generate Token 
router.post("/generate", cors(), async (
        user_id,
        username,
        email,
        hashedPassword,
        user_role,
        res
    ) => {
        try {
            //create and assign a token
            let jwtSecretKey = process.env.JWT_SECRET_KEY;
            let jwtRefreshKey = process.env.JWT_REFRESH_KEY;
    
            let data = {
                time: Date(),
                user_id: user_id,
                username: username,
                email: email,
                password: hashedPassword,
                user_role: user_role,
                accessToken_expires_in: accessToken_expires_in, 
                refreshoken_expires_in: refreshToken_expires_in, 
            };
    
            const accessToken = jwt.sign(data, jwtSecretKey, {expiresIn: accessToken_expiresIn});
            const refreshToken = jwt.sign(data, jwtRefreshKey, {expiresIn: refreshToken_expiresIn}); 
    
            // Format the tokens as Bearer token
            const bearer_accessToken = `${accessToken}`;
            const bearer_refreshToken = `${refreshToken}`;
    
            // Get the last inserted login id from the database
            const lastLogin = await Login.findOne({}, {}, { sort: { id: -1 } });
            let nextId = 1;
        
            if (lastLogin) {
             nextId = lastLogin.id + 1;
            }
    
            const login = new Login({
                id: nextId,
                email: email,
                password: hashedPassword,
                user_role: user_role,
                login_time: Date.now(),
            });
    
            // Save the login details
            const loggedInUser = await login.save();
    
            let tokenObj = {
                // logged_user: loggedInUser,
                user_id: user_id,
                user_role: user_role,
                token_type: "Bearer",
                access_token: bearer_accessToken,
                // expires_in: 3600 / 60 + " min",
                access_token_expires_in: accessToken_expires_in,
                refresh_token: bearer_refreshToken,
                refresh_token_expires_in: refreshToken_expires_in,
            };
            return tokenObj;
        } catch (err) {
            return res.status(400).send({ status: 400, message: err.message });
        }
    }
);
  
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

module.exports = router;