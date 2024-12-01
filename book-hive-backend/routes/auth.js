import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Login from "../models/login.models.js"
import User from "../models/user.models.js"

import { refreshToken, verifyToken, authenticateAdminToken, authenticateReaderToken } from "../middleware/auth.js";

dotenv.config();

const app = express();
const router = express.Router();

const accessToken_expiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRE
const refreshToken_expiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRE;

// const accessToken_expires_in = "1800 seconds"
const accessToken_expires_in = "24 hours"
const refreshToken_expires_in = "24 hours"

// Get all logged users
router.get("/getAll", cors(), authenticateAdminToken, async (req, res) => {
    console.log("inside getAll: admin - auth")
    try {
      const loggedUsers = await Login.find();
      
      if (loggedUsers.length === 0) {
          return res.status(200).json({ 
              status: 200, 
              message: "No users found in the database.", 
              data: [] 
          });
      }
  
      return res.status(200).json({ 
          status: 200, 
          message: "Logged users retrieved successfully.", 
          data: loggedUsers 
      });
    } catch (error) {
      return res.status(500).json({ 
        status: 500, 
        message: "An error occurred while fetching logged users.", 
        error: error.message 
      });
    }
});

// Sign Up & generate JWT token
router.post("/signup", cors(), async (req, res) => {
  console.log("inside signup - auth")
  
  try {
      const body = req.body;

      // Check if user already exists
      const emailExist = await User.findOne({ email: body.email });
      if (emailExist) {
        return res
          .status(400)
          .json({ status: 400, message: "A user with the same email address already exists." });
      }
  
      const contactExist = await User.findOne({ contact_no: body.contact_no });
      if (contactExist) {
        return res
          .status(400)
          .send({ status: 400, message: "A user with the same contact number already exists." });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);
  
      const nextUserId = await generateNextUserId();

      // Create a new user instance
      const newUser = new User({
          user_id: nextUserId,
          first_name: body.first_name,
          last_name: body.last_name,
          username: body.username,
          email: body.email,
          password: hashedPassword,
          contact_no: body.contact_no,
          user_role: body.user_role,
          linked_discord_id: body.linked_discord_id,
      });
  
      // Save the user to the database
      const savedUser = await newUser.save();
      console.log("======savedUser=======")
      // console.log(savedUser)

      // Call login() in login router
      let tokenData = await generateToken(
          nextUserId,
          body.username,
          body.email,
          hashedPassword,
          body.user_role,
          res
      );

      console.log("=============== signup - tokenData in auth.js: ===============");
      console.log(tokenData);

      try {
        if (savedUser && tokenData) {
          return res.status(201).send({
            status: 201, 
            message: "User signed up successfully!", 
            data: tokenData
          });

        } else {
          res.status(400).send({ status: 400, message: 'Failed to sign up!' });
        }

      } catch (err) {
        if (err.name === 'ValidationError') {
          res.status(400).send({ status: 400, message: err.message });

        } else if (err.code === 11000) { // Handle duplicate key errors
          const duplicateField = Object.keys(err.keyPattern)[0];
          const message = `A user with the same ${duplicateField} already exists.`;
          res.status(400).send({ status: 400, message });
          
        } else {
          res.status(500).send({ status: 500, message: 'Server error' });
        }
      }
      
    } catch (err) {
      return res.status(400).send({status: 400, message: err.message});
    }
});

// Login User & generate JWT token -  in use
router.post("/login", cors(), async (req, res) => {
  console.log("inside login - auth")

  try {
    console.log(req.body);
    const userExist = await User.findOne({ email: req.body.email });
    const userAlreadyLogged = await Login.findOne({ email: req.body.email });

    if (userAlreadyLogged)
      return res
        .status(400)
        .send({ status: 400, message: "User already logged in." });

    if (!userExist)
      return res
        .status(400)
        .send({ status: 400, message: "Incorrect email address." });

    const validPassword = await bcrypt.compare(
      req.body.password,
      userExist.password
    );

    if (!validPassword)
      return res
        .status(400)
        .send({ status: 400, message: "Incorrect password." });

    const tokenData = await generateToken(
        userExist.user_id,
        userExist.username,
        req.body.email,
        userExist.password,
        userExist.user_role,
      res
    );

    console.log("=============== login - tokenData in auth.js: ===============");
    // console.log(tokenData);

    try {
      if (tokenData) {
          return res.status(201).send({
            status: 201, 
            message: "User logged in successfully!", 
            data: tokenData
          });

      } else {
          res.status(400).send({ status: 400, message: 'Failed to login' });
      }

    } catch (err) {
      if (err.name === 'ValidationError') {
          res.status(400).send({ status: 400, message: err.message });

      } else if (err.code === 11000) { // Handle duplicate key errors
          const duplicateField = Object.keys(err.keyPattern)[0];
          const message = `A user with the same ${duplicateField} already exists.`;
          res.status(400).send({ status: 400, message });
        
      } else {
          res.status(500).send({ status: 500, message: 'Server error' });
      }
    }

  } catch (err) {
    return res.status(500).send({ status: 500, message: err.message });
  }
});

// Logout User
router.delete("/logout", cors(), async (req, res) => {
  console.log("inside logout - auth")

  try {
    console.log(req.body);
    const userAlreadyLogged = await Login.findOne({ email: req.body.email });

    const loggesUser = await Login.findOne({ email: req.body.email });
    if (loggesUser == null) {
      return res.status(404).send({ status: 404, message: "User not found." });
    }
    let deletedUser = await Login.deleteOne(loggesUser);

    return res.status(200).send({
      status: 200,
      message: "User logout successfully!",
      data: deletedUser,
    });
  } catch (err) {
    return res.status(400).send({ status: 400, message: err.message });
  }
});

const generateToken = async (
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

      // console.log(data);

      // const accessToken = jwt.sign(data, jwtSecretKey, { expiresIn: "1800s" });
      // const refreshToken = jwt.sign(data, jwtRefreshKey, { expiresIn: "3600s" });

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
};

const generateNextUserId = async () => {
  try {
    const lastId = await User.findOne(
      {},
      {},
      { sort: { user_id: -1 } }
    );
    let nextId = 1;

    if (lastId) {
      nextId = lastId.user_id + 1;
    }

    return nextId;
  } catch (error) {
    res.status(500).send({status: 500, message: error});
  }
}


export { generateToken, router };