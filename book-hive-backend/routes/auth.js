import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";

import Login from "../models/login.models.js"
import User from "../models/user.models.js"

dotenv.config();

const app = express();
const router = express.Router();

// Get all logged users
router.get("/getAll", cors(), async (req, res) => {
    console.log("inside getAll -auth")
    try {
      const loggedUsers = await Login.find();
      return res.status(200).json({ status: 200, data: loggedUsers });
    } catch (error) {
      return res.status(500).send({ status: 500, message: error });
    }
});


// Sign Up
router.post("/signup", cors(), async (req, res) => {
    const body = req.body;

    console.log("inside signup - auth")
  
    try {
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
  
      // Get the last inserted user_id from the database
      const lastUser = await User.findOne({}, {}, { sort: { user_id: -1 } });
      let nextUserId = 1;
  
      if (lastUser) {
        nextUserId = lastUser.user_id + 1;
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);
  
      // Create a new user instance
      const user = new User({
        user_id: nextUserId,
        username: body.username,
        email: body.email,
        password: hashedPassword,
        contact_no: body.contact_no,
        linked_discord_id: body.linked_discord_id,
      });
  
      // Save the user to the database
      const savedUser = await user.save();
      console.log("======savedUser=======")
      console.log(savedUser)
  
      /* if (savedUser) {
        // send response after registering & login
        return res.status(201).send({
          status: 201,
          message: "User signed up successfully!",
        });
      } else {
        return res.status(400).send({ status: 400, message: "Failed to login." });
      } */

      try {
        if (savedUser) {
          return res.status(201).send({status: 201, message: "User signed up successfully!"});

        } else {
          res.status(201).send({ status: 201, message: 'Failed to sign up!' });
        }

      } catch (err) {
        if (err.name === 'ValidationError') {
          res.status(400).send({ status: 400, message: err.message });

        } else if (err.code === 11000) {
          // Handle duplicate key errors
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

export default router;