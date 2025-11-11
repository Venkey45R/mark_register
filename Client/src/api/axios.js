import axios from "axios";

const instance = axios.create({
  baseURL: "https://mark-register.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
