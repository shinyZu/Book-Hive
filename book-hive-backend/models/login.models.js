import mongoose from 'mongoose';

const { Schema } = mongoose;

const LoginSchema = new Schema(
  {
    id: { 
        type: Number,
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
            message: (val) => "Invalid Email!",
        },
    },
    password: {
        type: String,
        required: true,
        unique: true,
        minLength: [8, "Password should be at least 8 characters"],
        maxlength: 1024,
    },
    login_time: { 
        type: Date,
        required: true,
    },
    logout_time: { 
        type: Date,
        required: true,
    },
  },
  {
    timestamps: true, // Automatically creates and updates `createdAt` and `updatedAt` fields.
  }
);

const Login = mongoose.model('Login', LoginSchema);

export default Login;
