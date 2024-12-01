import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { OpenAI } from 'openai';

import Book from "../models/book.models.js"
import ReadingHistory from "../models/reading-history.models.js"

import { refreshToken, verifyToken, authenticateAdminToken, authenticateReaderToken } from "../middleware/auth.js";

dotenv.config();

const app = express();
const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// Get all books - Readers
// Search book by title, author, genre, published_year - Readers
router.get("/", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside getAll - books")
    try {

        const { title, author, genre, published_year } = req.query;

        // Build the search criteria based on provided query parameters
        const searchCriteria = {};
        if (title) {
            searchCriteria.title = { $regex: title, $options: "i" }; // Case-insensitive partial search
        }
        if (author) {
            searchCriteria.author = { $regex: author, $options: "i" }; 
        }
        if (genre) {
            searchCriteria.genre = { $regex: genre, $options: "i" };
        }
        if (published_year) {
            searchCriteria.published_year = { $regex: published_year, $options: "i" };
        }

        console.log("searchCriteria: " + searchCriteria);
          
        // Find books matching the search criteria, or return all books if no criteria are provided
        // Lookup functionality
        const bookList = await Book.aggregate([
          {
            $match: Object.keys(searchCriteria).length ? searchCriteria : {},
          },
          {
            $lookup: {
              from: "reviews", // the collection name in MongoDB
              localField: "book_id", // the field from the Book collection
              foreignField: "book_id", // the corresponding field in the Review collection
              as: "Reviews" // the name of the field where the joined data will be placed
            }
          },
          /* {
            $lookup: {
              from: "readinghistories",
              localField: "book_id", 
              foreignField: "book_id",
              as: "ReadingHistory"
            }
          }, */
        ])
        
        if (bookList.length === 0) {
          return res.status(200).json({ 
            status: 200, 
            message: "No books found.", 
            data: [] 
          });
        }
    
        return res.status(200).json({ 
          status: 200, 
          message: "Books fetched successfully.", 
          data: bookList 
        });
      } catch (error) {
        return res.status(500).json({ 
          status: 500, 
          message: "An error occurred while fetching books.", 
          error: error.message 
        });
      }
});

// Search book by Id - Readers
router.get("/:book_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside search book by id - books");

    try {
      const bookFound = await Book.findOne({
          book_id: req.params.book_id,
      });

      if (!bookFound) {
        return res
          .status(404)
          .send({ status: 404, message: "Book not found." });
      }

      return res.send({
          status: 200,
          data: bookFound,
      });
    } catch (err) {
      return res.status(400).send({ status: 400, message: err.message });
    }
  }
);

// Save book 
router.post("/", cors(), authenticateAdminToken, async (req, res) => {
    console.log("inside save book - book")
    
    try {
        const body = req.body;
  
        // Check if book already exists
        const bookExist = await Book.findOne({ title: body.title });
        if (bookExist) {
          return res
            .status(400)
            .json({ status: 400, message: "A book with the same title already exists." });
        }
    
        // Get the last inserted book_id from the database
        const lastBook = await Book.findOne({}, {}, { sort: { book_id: -1 } });
        let nextBookId = 1;
    
        if (lastBook) {
          nextBookId = lastBook.book_id + 1;
        }
    
        // Create a new Book instance
        const newBook = new Book({
            book_id: nextBookId,
            title: body.title,
            description: body.description,
            author: body.author,
            genre: body.genre,
            published_year: body.published_year,
        });
    
        // Save the book to the database
        const savedBook = await newBook.save();
        res.status(201).send({
            status: 201,
            data: savedBook,
            message: "Book saved successfully!",
        });
        
      } catch (err) {
        return res.status(400).send({status: 400, message: err.message});
      }
});

// Update book details  - Admin
router.put("/:book_id", cors(), authenticateAdminToken, async (req, res) => {
    console.log("inside update book by id: admin - books");
  
    try {
      const body = req.body;
      const bookExist = await Book.findOne({ book_id: req.params.book_id });
  
      if (!bookExist) {
        return res.status(404).send({ status: 404, message: "Book not found." });
      }
  
      // Update book fields
      bookExist.title = body.title;
      bookExist.description = body.description;
      bookExist.author = body.author;
      bookExist.genre = body.genre;
      bookExist.published_year = body.published_year;
  
      const updatedBook = await bookExist.save();
  
      return res.send({
        status: 200,
        data: updatedBook,
        message: "Book updated successfully!",
      });
    } catch (err) {
      console.error(err);
      return res.status(400).send({ status: 400, message: err.message });
    }
});

// Partially update book details  - Admin
router.patch("/:book_id", cors(), authenticateAdminToken, async (req, res) => {
    console.log("inside patch book by id: admin - books");
  
    try {
        const body = req.body;
        const bookExist = await Book.findOne({ book_id: req.params.book_id });
    
        if (!bookExist) {
            return res.status(404).send({ status: 404, message: "Book not found." });
        }
    
        // Convert Mongoose document to object
        const bookData = bookExist.toObject();

        // Update only the fields provided in the request body
        Object.keys(body).forEach((key) => {
            if (Object.hasOwnProperty.call(bookData, key)) {
                console.log("key", key);
                bookExist[key] = body[key];
            }
        });
    
        const updatedBook = await bookExist.save();
    
        return res.send({
            status: 200,
            data: updatedBook,
            message: "Book updated successfully!",
        });
    } catch (err) {
      console.error(err);
      return res.status(400).send({ status: 400, message: err.message });
    }
});

// Delete book - Admin
router.delete("/:book_id", cors(), authenticateAdminToken, async (req, res) => {
    console.log("inside delete book by id: admin - books");
    try {
      const bookExist = await Book.findOne({
        book_id: req.params.book_id,
      });

      if (!bookExist) {
        return res
          .status(404)
          .send({ status: 404, message: "Book not found." });
      }
      let deletedBook = await Book.deleteOne(bookExist);

      return res.send({
        status: 200,
        message: "Book deleted successfully!",
        data: deletedBook,
      });
    } catch (err) {
      return res.status(400).send({ statttus: 400, message: err.message });
    }
});

// ----------- Book Recommend API --------

// Get recommendations using OpenAI's GPT-3/ChatGPT
router.get("/recommend/open-ai", cors(), authenticateReaderToken, async (req, res) => {
  console.log("inside recommend book - books");

  const { user_id } = req.query; // User ID and TODO: reading history to be passed from the frontend

  if (!user_id) {
    return res.status(400).json({
      message: "User ID is required for book recommendations.",
    });
  }

  try {
    // Step 1: Fetch the user's reading history from the database
    const readingHistory = await ReadingHistory.find({ user_id: Number(user_id) });
    if (readingHistory.length === 0) {
      return res.status(404).json({
        message: "No reading history found for this user.",
      });
    }

    // Step 2: Extract book IDs from the user's reading history
    const readBooks = readingHistory.map(entry => entry.book_id);

    console.log("readBooks: ", readBooks);
    
    // Step 3: Fetch books from the database that the user has read
    const books = await Book.find({ 'book_id': { $in: readBooks } });

    // Step 4: Prepare a string of genres and authors for OpenAI's prompt
    const genres = [...new Set(books.map(book => book.genre))];
    const authors = [...new Set(books.map(book => book.author))];

    // Create a prompt for OpenAI
    const prompt = `
      Given the following reading history, recommend some books:
      Genres: ${genres.join(", ")}
      Authors: ${authors.join(", ")}
      
      The user is looking for books similar to their reading preferences. Provide a list of book titles with authors, genres, and short descriptions.
    `;

    // Step 5: Make a request to OpenAI to generate book recommendations
    const openAiResponse = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'gpt-3.5-turbo', // Use the appropriate model here
      max_tokens: 150,
    });

    // Step 6: Parse OpenAI's response and return recommendations
    const recommendations = openAiResponse.choices[0].message.content;;

    return res.status(200).json({
      message: "Book recommendations generated successfully.",
      data: recommendations, // Return the AI-generated recommendations
    });

  } catch (error) {
    console.error("Error while fetching book recommendations:", error);
    return res.status(500).json({
      message: "An error occurred while generating recommendations.",
      error: error.message,
    });
  }
})


export default router;