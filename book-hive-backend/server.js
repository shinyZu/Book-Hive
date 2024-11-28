import express from "express";
import dotenv from "dotenv";
import { establishConnection } from "./db.configs/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Invoke the method to establish connection with mongoDB
establishConnection;

const baseURL = "/book-hive/api/";

app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

app.get(`${baseURL}/`, (req, res) => {
    console.log(req);
    res.send("<h1>Hello Express!!!</h1>");
});

app.listen(PORT, () => {
    console.log(`Express App listening on Port ${PORT}`);
});
