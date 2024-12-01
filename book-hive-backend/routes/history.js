import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import ReadingHistory from "../models/reading-history.models.js"
import ReadingStatus from "../enums/reading-status.enum.js";

import { refreshToken, verifyToken, authenticateAdminToken, authenticateReaderToken } from "../middleware/auth.js";

dotenv.config();

const app = express();
const router = express.Router();

// Get all reading histories - Reader
router.get("/", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside getAll: reader - reading history")
    try {
        // const historyList = await ReadingHistory.find()
        const verified = verifyToken(req.headers.authorization, res);
        const { book_id, status  } = req.query;

        // Build the search criteria based on provided query parameters
        const searchCriteria = {};
        
        if (book_id) {
            searchCriteria.book_id = Number(book_id); 
        }

        if (status) {
            searchCriteria.status = { $regex: status, $options: "i" }; 
        }

        searchCriteria.user_id = Number(verified.user_id); 
        
        const historyList = await ReadingHistory.aggregate([
            {
                $match: Object.keys(searchCriteria).length ? searchCriteria : {},
            },
            {
                $lookup: {
                    from: "users", // The collection name for the User model
                    localField: "user_id", // The field in the ReadingHistory collection
                    foreignField: "user_id", // The corresponding field in the User collection
                    as: "User", // The field to hold the joined user data
                },
            },
            {
                $unwind: {
                    path: "$User", // Unwind the User array to flatten the data
                    preserveNullAndEmptyArrays: true, // Include reviews without user data
                },
            },
            {
                $lookup: {
                    from: "books", 
                    localField: "book_id", 
                    foreignField: "book_id", 
                    as: "Book", 
                },
            },
            {
                $unwind: {
                    path: "$Book", 
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]);

        if (historyList.length === 0) {
            return res.status(200).json({ 
                status: 200, 
                message: "No reading history found.", 
                data: [] 
            });
        }
    
        return res.status(200).json({ 
            status: 200, 
            message: "Reading history fetched successfully.", 
            data: historyList 
        });
      } catch (error) {
            return res.status(500).json({ 
                status: 500, 
                message: "An error occurred while fetching reading history.", 
                error: error.message 
            });
      }
});

// Search history by history_id - Readers
router.get("/:history_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside search reading history by id: reader - reading history");

    try {
        const verified = verifyToken(req.headers.authorization, res);

        const pipeline = [
            {
              $match: {
                history_id: Number(req.params.history_id),
                user_id: Number(verified.user_id),
              }
            },
            {
                $lookup: {
                    from: "users", // The collection name for the User model
                    localField: "user_id", // The field in the ReadingHistory collection
                    foreignField: "user_id", // The corresponding field in the User collection
                    as: "User", // The field to hold the joined user data
                },
            },
            {
                $unwind: {
                    path: "$User", // Unwind the User array to flatten the data
                    preserveNullAndEmptyArrays: true, // Include reviews without user data
                },
            },
            {
                $lookup: {
                    from: "books", 
                    localField: "book_id", 
                    foreignField: "book_id", 
                    as: "Book", 
                },
            },
            {
                $unwind: {
                    path: "$Book", 
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]

        const historyFound = await ReadingHistory.aggregate(pipeline);

        if (!historyFound) {
            return res
            .status(404)
            .send({ status: 404, message: "Reading history not found." });
        }

        return res.send({
            status: 200,
            data: historyFound,
        });
        } catch (err) {
        return res.status(400).send({ status: 400, message: err.message });
        }
  }
);

// Search reading history of user by user_id - Readers
router.get("/user/library", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside search reading history by user: reader - reading history");

    try {
        const verified = verifyToken(req.headers.authorization, res);

        const pipeline = [
            {
              $match: {
                user_id: Number(verified.user_id),
              }
            },
            {
                $lookup: {
                    from: "users", // The collection name for the User model
                    localField: "user_id", // The field in the ReadingHistory collection
                    foreignField: "user_id", // The corresponding field in the User collection
                    as: "User", // The field to hold the joined user data
                },
            },
            {
                $unwind: {
                    path: "$User", // Unwind the User array to flatten the data
                    preserveNullAndEmptyArrays: true, // Include reviews without user data
                },
            },
            {
                $lookup: {
                    from: "books", 
                    localField: "book_id", 
                    foreignField: "book_id", 
                    as: "Book", 
                },
            },
            {
                $unwind: {
                    path: "$Book", 
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]

        const historyFound = await ReadingHistory.aggregate(pipeline);

        if (!historyFound) {
            return res
            .status(404)
            .send({ status: 404, message: "Reading history not found." });
        }

        return res.send({
            status: 200,
            data: historyFound,
        });
        } catch (err) {
        return res.status(400).send({ status: 400, message: err.message });
        }
  }
);

// Save reading history 
router.post("/", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside save reading history: reader - reading history")
    
    try {
        const verified = verifyToken(req.headers.authorization, res);

        const body = req.body;

        // Validate if the provided status is part of the enum
        if (body.status && !Object.values(ReadingStatus).includes(body.status)) {
            return res.status(400).send({
                status: 400,
                message: `Invalid status value. Allowed values are: ${Object.values(ReadingStatus).join(', ')}`,
            });
        }
    
        // Create a new ReadingHistory instance
        const newHistory = new ReadingHistory({
            history_id: await generateNextHistoryId(),
            status: body.status || ReadingStatus.START_READING, // Default to 'Want To Read' if not provided
            // startDate: body.startDate,
            // endDate: body.endDate,
            user_id: verified.user_id,
            book_id: body.book_id,
        });
    
        // Save the reading history to the database
        const savedHistory = await newHistory.save();
        res.status(201).send({
            status: 201,
            data: savedHistory,
            message: "Reading history saved successfully!",
        });
        
      } catch (err) {
        return res.status(400).send({status: 400, message: err.message});
      }
});

// Update reading history details  - Reader
router.put("/:history_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside update reading history by id: reader - reading history");
  
    try {
        const verified = verifyToken(req.headers.authorization, res);

        const body = req.body;
        const historyExist = await ReadingHistory.findOne({ history_id: req.params.history_id, user_id: verified.user_id });
    
        if (!historyExist) {
            return res.status(404).send({ status: 404, message: "Reading history not found." });
        }
    
        // Update reading history fields
        historyExist.status = body.status;
        // historyExist.startDate = body.startDate;
        // historyExist.endDate = body.endDate;
        historyExist.user_id = verified.user_id;
        historyExist.book_id = body.book_id;
    
        const updatedHistory = await historyExist.save();
    
        return res.send({
            status: 200,
            data: updatedHistory,
            message: "Reading history updated successfully!",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ status: 400, message: err.message });
    }
});

// Update reading history status  - Reader
router.patch("/:history_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside update reading status by id: reader - reading history");
  
    try {
        const verified = verifyToken(req.headers.authorization, res);

        const body = req.body;
        const historyExist = await ReadingHistory.findOne({ history_id: req.params.history_id, user_id: verified.user_id });
    
        if (!historyExist) {
            return res.status(404).send({ status: 404, message: "Reading history not found." });
        }
    
        // Convert Mongoose document to object
        const historyData = historyExist.toObject();

        // Update only the fields provided in the request body
        Object.keys(body).forEach((key) => {
            if (Object.hasOwnProperty.call(historyData, key)) {
                console.log("key", key);
                historyExist[key] = body[key];
            }
        });
    
        const updatedHostory = await historyExist.save();
    
        return res.send({
            status: 200,
            data: updatedHostory,
            message: "Reading status updated successfully!",
        });
    } catch (err) {
      console.error(err);
      return res.status(400).send({ status: 400, message: err.message });
    }
});

// Delete reading history - Reader
router.delete("/:history_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside delete reading history by id: reader - reading history");
    try {
        const verified = verifyToken(req.headers.authorization, res);

        const historyExist = await ReadingHistory.findOne({
            history_id: req.params.history_id,
            user_id: verified.user_id,
        });

        if (!historyExist) {
            return res
            .status(404)
            .send({ status: 404, message: "Reading history not found." });
        }
        let deletedHistory = await ReadingHistory.deleteOne(historyExist);

        return res.send({
            status: 200,
            message: "Reading history deleted successfully!",
            data: deletedHistory,
        });
    } catch (err) {
      return res.status(400).send({ statttus: 400, message: err.message });
    }
});

const generateNextHistoryId = async () => {
    try {
      const lastId = await ReadingHistory.findOne(
        {},
        {},
        { sort: { history_id: -1 } }
      );
      let nextId = 1;
  
      if (lastId) {
        nextId = lastId.history_id + 1;
      }
  
      return nextId;
    } catch (error) {
      res.status(500).send({status: 500, message: error});
    }
}

export default router;