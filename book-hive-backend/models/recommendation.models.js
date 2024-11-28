import mongoose from 'mongoose';

const { Schema } = mongoose;

const RecommendationSchema = new Schema(
  {
    recommendation_id: { 
        type: Number,
        required: true,
        unique: true
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
    generated_at: {
        type: Date,
        default: Date.now
    },
  },
  {
    timestamps: true,
  }
);

const Recommendation = mongoose.model('Recommendation', RecommendationSchema);

export default Recommendation;
