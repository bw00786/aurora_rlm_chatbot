import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000", // Adjust to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});