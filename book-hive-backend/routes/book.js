import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import Book from "../models/book.models.js"

import { refreshToken, verifyToken, authenticateAdminToken, authenticateReaderToken } from "../middleware/auth.js";

dotenv.config();

const app = express();
const router = express.Router();

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
            searchCriteria.published_year = Number(published_year); // Ensure it's a number
        }

        console.log("searchCriteria: " + searchCriteria);

        // Find books matching the search criteria, or return all books if no criteria are provided
        const bookList = await Book.find(
            Object.keys(searchCriteria).length ? searchCriteria : {}
        );
        
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

export default router;