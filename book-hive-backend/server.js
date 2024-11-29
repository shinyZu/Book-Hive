import express from "express";
import dotenv from "dotenv";
import { establishConnection } from "./db.configs/db.js";

import user from "./routes/user.js";
import auth from "./routes/auth.js"

const app = express();

dotenv.config();

// Middleware
app.use(express.json());

// Invoke the method to establish connection with mongoDB
establishConnection;

const PORT = process.env.PORT;

const baseURL = "/book-hive/api";

app.use(`${baseURL}/users`, user);
app.use(`${baseURL}/auth`, auth);

app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

app.get(`${baseURL}/hello`, (req, res) => {
    res.send("<h1>Hello Express!!!</h1>");
});

app.listen(PORT, () => {
    console.log(`Express App listening on Port ${PORT}`);
});

export default app;

/*
 .env
  - file to store your sensitive credentials like API keys, Secret jeys. 
  
  dotenv 
  - a lightweight npm package that automatically loads environment variables from a ".env" file into the process. 
  - a zero-dependency module that loads environment variables from a .env file into process.env.
*/