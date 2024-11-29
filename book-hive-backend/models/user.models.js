import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    user_id: { 
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (val) {
                return /[A-z|0-9]{4,}@(gmail)(.com|.lk)/.test(val);
            },
            message: "Invalid email address."
        },
    },
    password: {
        type: String,
        required: true,
        unique: true,
        minLength: [8, "Password should be at least 8 characters"],
        maxlength: 1024,
    },
    contact_no: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: function (val) {
                return val.toString().length === 9;
            },
            message: "Invalid Contact Number!",
        },
    },
    user_role: {
        type: String,
        required: true,
    },
    linked_discord_id: { 
        type: String
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', UserSchema);

export default User;
