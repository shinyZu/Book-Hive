import mongoose from 'mongoose';
import ReadingStatus from '../enums/reading-status.enum';

const { Schema } = mongoose;

const ReadingHistorySchema = new Schema(
  {
    history_id: { 
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
    status: { 
      type: String, 
      enum: Object.values(ReadingStatus), // Restrict to enum values
      default: ReadingStatus.TO_READ,
    },
    startDate: {
      type: Date,
      required: false
    },
    endDate: {
      type: Date,
      required: false
    },
  },
  {
    timestamps: true,
  }
);

const ReadingHistory = mongoose.model('ReadingHistory', ReadingHistorySchema);

export default ReadingHistory;
