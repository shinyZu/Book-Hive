import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:4000/book-hive/api",
});

export default instance;