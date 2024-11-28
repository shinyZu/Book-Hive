import mongoose from 'mongoose';

const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    review_id: { 
        type: Number,
        required: true,
        unique: true
    },
    rating: {
        type: Number,
        required: false,
        min: 1,
        max: 5,
    },
    review_text: {
        type: String,
        required: false,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book_id: {
        type: Schema.Types.ObjectId,
        ref: 'Book', 
        required: true
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', ReviewSchema);

export default Review;
