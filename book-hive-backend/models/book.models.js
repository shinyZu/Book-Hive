import mongoose from 'mongoose';

const { Schema } = mongoose;

const BookSchema = new Schema(
  {
    book_id: { 
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    published_year: {
        type: String,
        required: true,
    },
    image_name: {
      type: String,
      // required: true,
    },
    image_url: {
      type: String,
      // required: true,
    },
  
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model('Book', BookSchema);

export default Book;
