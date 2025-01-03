import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import Review from "../models/review.models.js"
import Book from "../models/book.models.js"

import { refreshToken, verifyToken, authenticateAdminToken, authenticateReaderToken } from "../middleware/auth.js";

dotenv.config();

const app = express();
const router = express.Router();

// Get all reviews - Reader
router.get("/", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside getAll - reviews")
    try {
        // const reviewList = await Review.find();

        const reviewList = await Review.aggregate([
            {
                $lookup: {
                    from: "users", // The collection name for the User model
                    localField: "user_id", // The field in the Review collection
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
        ]);

        if (reviewList.length === 0) {
            return res.status(200).json({ 
                status: 200, 
                message: "No reviews found.", 
                data: [] 
            });
        }
    
        return res.status(200).json({ 
            status: 200, 
            message: "Reviews fetched successfully.", 
            data: reviewList 
        });
      } catch (error) {
            return res.status(500).json({ 
                status: 500, 
                message: "An error occurred while fetching reviews.", 
                error: error.message 
            });
      }
});

// Search review by Id - Reader
router.get("/:review_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside search review by review id - reviews");

    try {

      const verified = verifyToken(req.headers.authorization, res);

      const pipeline = [
          {
            $match: {
              review_id: Number(req.params.review_id),
              user_id: Number(verified.user_id),
            }
          },
          {
              $lookup: {
                  from: "users", // The collection name for the User model
                  localField: "user_id", // The field in the Review collection
                  foreignField: "user_id", // The corresponding field in the User collection
                  as: "User", // The field to hold the joined user data
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
                  path: "$User", // Unwind the User array to flatten the data
                  preserveNullAndEmptyArrays: true, // Include reviews without user data
              },
          },
      ]

      const reviewFound = await Review.aggregate(pipeline);

      console.log('\n');
      console.log("===========reviewFound============");
      console.log(reviewFound);

      if (reviewFound.length === 0) {
        return res
          .status(404)
          .send({ status: 404, message: "Review not found." });
      }

      return res.send({
          status: 200,
          data: reviewFound,
          message: "Reviews fetched successfully.",
      });
    } catch (err) {
      return res.status(400).send({ status: 400, message: err.message });
    }
  }
);

// Search review by book_id - Reader
router.get("/book/:book_id", cors(), authenticateReaderToken, async (req, res) => {
  console.log("inside get reviews for a book  - reviews");

  try {

    const bookExist = await Book.findOne({ book_id: req.params.book_id });

    if (bookExist) {
      const pipeline = [
          {
            $match: {
              book_id: Number(bookExist.book_id),
            }
          },
          {
              $lookup: {
                  from: "users", // The collection name for the User model
                  localField: "user_id", // The field in the Review collection
                  foreignField: "user_id", // The corresponding field in the User collection
                  as: "User", // The field to hold the joined user data
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
                  path: "$User", // Unwind the User array to flatten the data
                  preserveNullAndEmptyArrays: true, // Include reviews without user data
              },
          },
      ]

      const reviewsFound = await Review.aggregate(pipeline); 
      
      if (!reviewsFound) {
        return res
          .status(404)
          .send({ status: 404, message: "Reviews not found." });
      }
  
      return res.send({
          status: 200,
          message: "Reviews for book fetched successfully.",
          data: reviewsFound,
      });
    } else {
      return res
          .status(404)
          .send({ status: 404, message: "Book not found." });
    }
  } catch (err) {
    return res.status(400).send({ status: 400, message: err.message });
  }
}
);

// Save review - Reader
router.post("/", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside save review - review")
    
    try {
        const verified = verifyToken(req.headers.authorization, res);

        const body = req.body;
    
        // Create a new Review instance
        const newReview = new Review({
            review_id: await generateNextReviewId(),
            rating: body.rating,
            review_text: body.review_text,
            user_id: verified.user_id,
            book_id: body.book_id,
        });
    
        // Save the review to the database
        const savedReview = await newReview.save();
        res.status(201).send({
            status: 201,
            data: savedReview,
            message: "Review saved successfully!",
        });
        
      } catch (err) {
        return res.status(400).send({status: 400, message: err.message});
      }
});

// Update review details  - Reader
router.put("/:review_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside update review by id: reader - reviews");
  
    try {
        const verified = verifyToken(req.headers.authorization, res);

        const body = req.body;
        const reviewExist = await Review.findOne({ review_id: req.params.review_id, user_id: verified.user_id, book_id: body.book_id });
    
        if (!reviewExist) {
            return res.status(404).send({ status: 404, message: "Review not found." });
        }
    
        // Update review fields
        reviewExist.rating = body.rating;
        reviewExist.review_text = body.review_text;
        reviewExist.user_id = verified.user_id;
        reviewExist.book_id = body.book_id;
    
        const updatedReview = await reviewExist.save();
    
        return res.send({
            status: 200,
            data: updatedReview,
            message: "Review updated successfully!",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ status: 400, message: err.message });
    }
});

// Partially update review details/ update Rating  - Reader
router.patch("/:review_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside patch review by id: reader - reviews");
  
    try {
        const verified = verifyToken(req.headers.authorization, res); 
        
        const body = req.body;
        const reviewExist = await Review.findOne({ review_id: req.params.review_id, user_id: verified.user_id, book_id: body.book_id  });
    
        if (!reviewExist) {
            return res.status(404).send({ status: 404, message: "Review not found." });
        }
    
        // Convert Mongoose document to object
        const reviewData = reviewExist.toObject();

        // Update only the fields provided in the request body
        Object.keys(body).forEach((key) => {
            if (Object.hasOwnProperty.call(reviewData, key)) {
                console.log("key", key);
                reviewExist[key] = body[key];
            }
        });
    
        const updatedReview = await reviewExist.save();
    
        return res.send({
            status: 200,
            data: updatedReview,
            message: "Review updated successfully!",
        });
    } catch (err) {
      console.error(err);
      return res.status(400).send({ status: 400, message: err.message });
    }
});

// Delete review - Reader
router.delete("/:review_id", cors(), authenticateReaderToken, async (req, res) => {
    console.log("inside delete review by id: reader - reviews");
    try {
      const verified = verifyToken(req.headers.authorization, res);

      const reviewExist = await Review.findOne({
        review_id: req.params.review_id,
        user_id: verified.user_id,
      });

      if (!reviewExist) {
        return res
          .status(404)
          .send({ status: 404, message: "Review not found." });
      }
      let deletedReview = await Review.deleteOne(reviewExist);

      return res.send({
        status: 200,
        message: "Review deleted successfully!",
        data: deletedReview,
      });
    } catch (err) {
      return res.status(400).send({ statttus: 400, message: err.message });
    }
});

const generateNextReviewId = async () => {
    try {
      const lastId = await Review.findOne(
        {},
        {},
        { sort: { review_id: -1 } }
      );
      let nextId = 1;

      if (lastId) {
        nextId = lastId.review_id + 1;
      }

      return nextId;
    } catch (error) {
      res.status(500).send({status: 500, message: error});
    }
}

export default router;