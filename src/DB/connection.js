import mongoose from "mongoose";
import { DB_URL } from "../config/env.config.js";

export function connectDB() {
  mongoose
    .connect(DB_URL)
    .then(() => {
      console.log("DB connected successfully");
    })
    .catch(() => {
      console.log("fail to connect to DB");
    });
}
