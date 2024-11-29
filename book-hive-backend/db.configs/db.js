import dotenv from "dotenv";
import mongoose from "mongoose";

// Dynamically load the appropriate .env file based on NODE_ENV
const env = `.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ""}`;
dotenv.config({ path: env });

// Log the environment being used (optional, for debugging)
console.log(`Using environment file: ${env}`);

// Database URL to connect with
const url = process.env.URL;

if (!url) {
  throw new Error("Database URL not found in the environment variables!");
}

// Create MongoDB Connection
const establishConnection = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true, // Ensures proper connection management
});

const conn = mongoose.connection;
// console.log(conn)

// runs everytime when connected to mongodb
conn.on("open", () => {
  console.log("Connected to MongoDB Atlas...!");
});

export { establishConnection, conn };
