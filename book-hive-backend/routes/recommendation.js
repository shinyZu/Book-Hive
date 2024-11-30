import express from 'express';
import cors from 'cors';

import { refreshToken, verifyToken, authenticateAdminToken, authenticateReaderToken } from "../middleware/auth.js";

import ReadingHistory from '../models/reading-history.models.js';
import Recommendation from '../models/recommendation.models.js';
import Book from '../models/book.models.js'; 

import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

// Get all recommendations - Admin
router.get("/getAll", cors(), authenticateAdminToken, async (req, res) => {
    console.log("inside getAll recommendations: admin - reading history")
    try {
        // const historyList = await ReadingHistory.find()
        
        const recommendedBookList = await Recommendation.aggregate([
            {
                $lookup: {
                    from: "users", // The collection name for the User model
                    localField: "user_id", // The field in the Recommendation collection
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

        if (recommendedBookList.length === 0) {
            return res.status(200).json({ 
                status: 200, 
                message: "No recommendations found.", 
                data: [] 
            });
        }
    
        return res.status(200).json({ 
            status: 200, 
            message: "Recommendations fetched successfully.", 
            data: recommendedBookList 
        });
      } catch (error) {
            return res.status(500).json({ 
                status: 500, 
                message: "An error occurred while fetching recommendations.", 
                error: error.message 
            });
      }
});

// Get recommendations
router.get("/", cors(), authenticateReaderToken, async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({
            status: 400,
            message: "User ID is required for book recommendations."
        });
    }

    try {
        // Step 1: Get the user's reading history
        const readingHistory = await ReadingHistory.find({ user_id: Number(user_id) });

        if (readingHistory.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No reading history found for this user."
            });
        }

        // Step 2: Get the genres or authors from the user's reading history
        const readBooks = readingHistory.map(entry => entry.book_id);
        const books = await Book.find({ 'book_id': { $in: readBooks } });

        // Assuming books have 'genre' and 'author' properties
        const genres = [...new Set(books.map(book => book.genre))]; // Unique genres
        const authors = [...new Set(books.map(book => book.author))]; // Unique authors

        // Step 3: Find books that match the user's genres or authors, excluding books they've already read
        const recommendedBooks = await Book.find({
            $or: [
                { genre: { $in: genres } },
                { author: { $in: authors } }
            ],
            book_id: { $nin: readBooks } // Exclude books already read by the user
        });

        // Step 4: Check if there are recommended books
        if (recommendedBooks.length === 0) {
            return res.status(200).json({
                status: 200,
                message: "No books were found to recommend based on your reading history.",
                data: []
            });
        }

        // Step 5: Create a recommendation entry for each recommended book
        // const recommendations = recommendedBooks.map(async(book) => ({
        //     // recommendation_id: await generateNextRecommendationId(),
        //     user_id: Number(user_id),
        //     book_id: book._id,
        // }));

        // Step 6: Save the recommendations to the database
        // await Recommendation.insertMany(recommendations);

        return res.status(200).json({
            status: 200,
            message: "Books recommended successfully.",
            data: recommendedBooks,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: "An error occurred while recommending books.",
            error: error.message
        });
    }
});

const generateNextRecommendationId = async () => {
    try {
      const lastId = await Recommendation.findOne(
        {},
        {},
        { sort: { review_id: -1 } }
      );
      let nextId = 1;

      if (lastId) {
        nextId = lastId.recommendation_id + 1;
      }

      return nextId;
    } catch (error) {
      res.status(500).send({status: 500, message: error});
    }
}

export default router;
