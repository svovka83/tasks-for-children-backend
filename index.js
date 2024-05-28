import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import {
  registerValidation,
  loginValidation,
} from "./validations/validationConditions.js";
import { validationErrors } from "./validations/validationErrors.js";
import { checkAuth } from "./utils/checkAuth.js";

import {
  register,
  login,
  getMe,
  getAllUsers,
} from "./controller/UserController.js";
import {
  createPosts,
  getAllPosts,
  getOnePost,
} from "./controller/PostController.js";

const app = express();
const PORT = process.env.PORT || 5555;

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("DataBase connecting");
  })
  .catch((err) => {
    console.log("DataBase error", err);
    process.exit(1);
  });

app.use(express.json());
app.use(cors());

app.post("/register", registerValidation, validationErrors, register);
app.post("/login", loginValidation, validationErrors, login);
app.get("/me", checkAuth, getMe);
app.get("/users", getAllUsers);

app.post("/posts", createPosts);
app.get("/posts", getAllPosts);
app.get("/posts/:id", getOnePost);

app.listen(PORT, (err) => {
  if (err) {
    return console.log("Some error:", err);
  }
  console.log("Server is working.");
});
