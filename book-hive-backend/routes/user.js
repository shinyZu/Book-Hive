import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import User from "../models/user.models.js"

import { refreshToken, verifyToken, authenticateAdminToken, authenticateReaderToken } from "../middleware/auth.js";

dotenv.config();

const app = express();
const router = express.Router();

// Get all users
router.get("/", cors(), authenticateAdminToken, async (req, res) => {
    console.log("inside getAll - users")
    try {

        // const users = await User.find();
        const users = await User.aggregate([
          {
            $lookup: {
              from: "reviews", // the collection name in MongoDB
              localField: "user_id", // the field from the User collection
              foreignField: "user_id", // the corresponding field in the Review collection
              as: "Reviews" // the name of the field where the joined data will be placed
            }
          },
          {
            $lookup: {
              from: "readinghistories",
              localField: "user_id",
              foreignField: "user_id", 
              as: "ReadingHistory"
            }
          },
          {
            $lookup: {
              from: "recommendations",
              localField: "user_id",
              foreignField: "user_id", 
              as: "Recommendation"
            }
          },
        ])

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
router.get( "/search/admin/:user_id", cors(), authenticateAdminToken, async (req, res) => {
    console.log("inside search user by id: admin - books");
    try {

      const pipeline = [
        {
          $match: {
            user_id: Number(req.params.user_id)
          }
        },
        {
          $lookup: {
            from: "reviews", // the collection name in MongoDB
            localField: "user_id", // the field from the User collection
            foreignField: "user_id", // the corresponding field in the Review collection
            as: "Reviews" // the name of the field where the joined data will be placed
          }
        },
        {
          $lookup: {
            from: "readinghistories",
            localField: "user_id",
            foreignField: "user_id", 
            as: "ReadingHistory"
          }
        },
        {
          $lookup: {
            from: "recommendations",
            localField: "user_id",
            foreignField: "user_id", 
            as: "Recommendation"
          }
        },
      ]

      const userFound = await User.aggregate(pipeline)

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
router.get("/search/:user_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside search user by id: reader - books");

    try {
      const pipeline = [
        {
          $match: {
            user_id: Number(req.params.user_id)
          }
        },
        {
          $lookup: {
            from: "reviews", // the collection name in MongoDB
            localField: "user_id", // the field from the User collection
            foreignField: "user_id", // the corresponding field in the Review collection
            as: "Reviews" // the name of the field where the joined data will be placed
          }
        },
        {
          $lookup: {
            from: "readinghistories",
            localField: "user_id",
            foreignField: "user_id", 
            as: "ReadingHistory"
          }
        },
        {
          $lookup: {
            from: "recommendations",
            localField: "user_id",
            foreignField: "user_id", 
            as: "Recommendation"
          }
        },
      ]

      const userFound = await User.aggregate(pipeline);

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
    console.log("inside update user by id: reader - books");

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

// Partially update user details  - Reader
router.patch("/:user_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside patch user by id: reader - user");

    try {
        const body = req.body;
        const userExist = await User.findOne({ user_id: req.params.user_id });

        if (!userExist) {
          return res.status(404).send({ status: 404, message: "User not found." });
        }

        if (req.email !== userExist.email) {
          return res.status(403).send({ status: 403, message: "Access denied." });
        }
    
        // Convert Mongoose document to object
        const userData = userExist.toObject();

        // Update only the fields provided in the request body
        Object.keys(body).forEach((key) => {
            if (Object.hasOwnProperty.call(userData, key)) {
                userExist[key] = body[key];
            }
        });
    
        const updatedUser = await userExist.save();
    
        return res.send({
            status: 200,
            book: updatedUser,
            message: "User updated successfully!",
        });
    } catch (err) {
      console.error(err);
      return res.status(400).send({ status: 400, message: err.message });
    }
});

// Delete user account - Authorized only for Readers to delete their own account
router.delete("/:user_id", cors(), authenticateReaderToken, async (req, res) => {
  console.log("inside delete user by id: reader - books");
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