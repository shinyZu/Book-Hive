import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import User from "../models/user.models.js"

dotenv.config();

const app = express();
const router = express.Router();

// Get all users
router.get("/getAll", cors(), async (req, res) => {
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

export default router;