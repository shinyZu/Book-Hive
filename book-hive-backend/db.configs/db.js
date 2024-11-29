import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Database URL to connect with
const url = process.env.URL;

// Create MongoDB Connection
// const establishConnection = async () => {
//   try {
//     await mongoose.connect(url);
//     console.log("Connected to MongoDB Atlas...!");
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error.message);
//     process.exit(1); // Exit the process on failure
//   }
// };

const establishConnection = mongoose.connect(url, {
  useNewUrlParser: true,
});

const conn = mongoose.connection;
// console.log(conn)

// runs everytime when connected to mongodb
conn.on("open", () => {
  console.log("Connected to MongoDB Atlas...!");
});

export { establishConnection, conn };
