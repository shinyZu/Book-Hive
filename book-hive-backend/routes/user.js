import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import User from "../models/user.models.js"

import { refreshToken, verifyToken, authenticateAdminToken, authenticateReaderToken } from "../middleware/auth.js";

dotenv.config();

const app = express();
const router = express.Router();

// Get all users
router.get("/getAll", cors(), authenticateAdminToken, async (req, res) => {
    console.log("inside getAll - users")
    try {
        const users = await User.find();
        
        if (users.length === 0) {
          return res.status(200).json({ 
            status: 200, 
            message: "No users found in the database.", 
            data: [] 
          });
        }
    
        return res.status(200).json({ 
          status: 200, 
          message: "Users retrieved successfully.", 
          data: users 
        });
      } catch (error) {
        return res.status(500).json({ 
          status: 500, 
          message: "An error occurred while fetching users.", 
          error: error.message 
        });
      }
});

// Search user by Id - Authorized only for Admin
router.get(
  "/search/admin/:user_id",
  cors(),
  authenticateAdminToken,
  async (req, res) => {
    try {

      const userFound = await User.findOne({
        user_id: req.params.user_id,
      });

      if (!userFound) {
        return res
          .status(404)
          .send({ status: 404, message: "User details not found." });
      }

      return res.send({
          status: 200,
          data: userFound,
      });
    } catch (err) {
      return res.status(400).send({ status: 400, message: err.message });
    }
  }
);

// Search user by Id - Authorized by relevant Reader
router.get(
  "/search/:user_id",
  cors(),
  authenticateReaderToken,
  async (req, res) => {
    try {

      const verified = verifyToken(req.headers.authorization, res);

      const userFound = await User.findOne({
          user_id: verified.user_id,
      });

      if (!userFound) {
        return res
          .status(404)
          .send({ status: 404, message: "User details not found." });
      }

      return res.send({
          status: 200,
          data: userFound,
      });
    } catch (err) {
      return res.status(400).send({ status: 400, message: err.message });
    }
  }
);

// Update user details  - only for Readers
router.put("/:user_id", cors(), authenticateReaderToken, async (req, res) => {
  try {
    const body = req.body;
    const userExist = await User.findOne({ user_id: req.params.user_id });

    if (!userExist) {
      return res.status(404).send({ status: 404, message: "User not found." });
    }

    if (req.email !== userExist.email) {
      return res.status(403).send({ status: 403, message: "Access denied." });
    }

    // Update user fields
    userExist.first_name = body.first_name;
    userExist.last_name = body.last_name;
    userExist.username = body.username;
    // userExist.email = body.email;
    // userExist.password = body.password;
    userExist.contact_no = body.contact_no;
    userExist.user_role = body.user_role;

    const updatedUser = await userExist.save();

    return res.send({
      status: 200,
      user: updatedUser,
      message: "User details updated successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ status: 400, message: err.message });
  }
});

// Delete user account - Authorized only for Readers to delete their own account
router.delete("/:user_id", cors(), authenticateReaderToken, async (req, res) => {
  try {
    const userExist = await User.findOne({
      user_id: req.params.user_id,
    });
    if (req.email == userExist.email) {
      if (userExist == null) {
        return res
          .status(404)
          .send({ status: 404, message: "User not found." });
      }
      let deletedUser = await User.deleteOne(userExist);

      return res.send({
        status: 200,
        message: "User deleted successfully!",
        data: deletedUser,
      });
    } else {
      return res.status(403).send({ status: 403, messge: "Access denied." });
    }
  } catch (err) {
    return res.status(400).send({ statttus: 400, message: err.message });
  }
});

export default router;