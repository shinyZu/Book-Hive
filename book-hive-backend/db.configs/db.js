import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Database URL to connect with
const url = process.env.URL;

// Create MongoDB Connection
const establishConnection = mongoose.connect(url);

const conn = mongoose.connection;

// runs everytime when connected to mongodb
conn.on("open", () => {
  console.log("Connected to MongoDB Atlas...!");
});

export { establishConnection, conn };
