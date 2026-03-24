import express from "express";
import { connectDB } from "./DB/connection.js";
import { authRouter, userRouter } from "./modules/index.js";
const app = express();

const port = 3000;

app.use("/uploads",express.static("uploads"))

app.use(express.json());
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.use((error, req, res, next) => {
  return res.status(error.cause || 500).json({
    message: error.message,
    details: error.details?.length == 0 ? undefined : error.details,
    success: false,
    stack: error.stack,
  });
});

connectDB();
app.listen(port, () => {
  console.log("app in listening on port", port);
});
