import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import { createServer } from "node:http";
import { Server } from "socket.io";

import {
  registerValidation,
  loginValidation,
} from "./validations/validationConditions.js";
import { validationErrors } from "./validations/validationErrors.js";
import { checkAuth } from "./utils/checkAuth.js";
import { addFriend } from "./utils/friends/addFriend.js";
import { removeFriend } from "./utils/friends/removeFriend.js";

import {
  register,
  login,
  getMe,
  updateMe,
  getAllUsers,
  getOneUser,
  updateFriends,
} from "./controller/UserController.js";
import {
  createDialog,
  getOneDialog,
  updateDialog,
  removeDialog,
} from "./controller/DialogController.js";
import {
  createPosts,
  getAllPosts,
  getOnePost,
  updatePost,
  removePost,
} from "./controller/PostController.js";
import {
  createComment,
  getAllComments,
  removeComment,
} from "./controller/CommentController.js";

import { uploadAvatar, createAvatar } from "./utils/multer.js";

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
app.use(cors({ origin: "*" }));
app.use("/uploads", express.static("uploads"));

app.post("/register", registerValidation, validationErrors, register);
app.post("/login", loginValidation, validationErrors, login);
app.get("/me", checkAuth, getMe);
app.put("/me", checkAuth, updateMe);
app.get("/users", getAllUsers);
app.get("/users/:id", getOneUser);
app.put("/users/add_friend/:id", checkAuth, addFriend, updateFriends);
app.put("/users/remove_friend/:id", checkAuth, removeFriend, updateFriends);

app.post("/upload", checkAuth, uploadAvatar.single("avatar"), createAvatar);

app.post("/dialogs/:id", checkAuth, createDialog);
app.get("/dialogs/:id", checkAuth, getOneDialog);
app.put("/dialogs/:id", checkAuth, updateDialog);
app.delete("/dialogs/:id", checkAuth, removeDialog);

app.post("/posts", checkAuth, createPosts);
app.get("/posts", getAllPosts);
app.get("/posts/:id", getOnePost);
app.put("/posts/:id", updatePost);
app.delete("/posts/:id", checkAuth, removePost);

app.post("/comments", checkAuth, createComment);
app.get("/comments", getAllComments);
app.delete("/comments/:id", checkAuth, removeComment);

const server = createServer(app);

const chat = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

chat.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    socket.join(room);
    socket.emit("message", {
      params: { name: "Admin" },
      message: `Hello ${name}`,
    });

    socket.broadcast.to(room).emit("message", {
      params: { name: "Admin" },
      message: `User ${name} joined to as.`,
    });

    socket.on("sendMessage", ({ params, message }) => {
      chat.to(room).emit("message", { params, message });
    });
    
    socket.on("leaveRoom", ({ name, room }) => {
      chat.to(room).emit("message", {
        params: { name: "Admin" },
        message: `User ${name} leave the chat`,
      });
    });
  });

  chat.on("disconnect", () => {
    console.log("Disconnect");
  });
});

// const dialog = new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//     },
//   });

//   dialog.on("connection", (socket) => {
//     socket.on("join", ({room}) => {
//       socket.join(room);

//       socket.on("sendMessage", (inputMessage) => {
//         dialog.to(room).emit("returnMessage", inputMessage)
//       })
//     });

//     dialog.on("disconnect", () => {
//       console.log("Disconnect");
//     });
//   });

server.listen(PORT, (err) => {
  if (err) {
    return console.log("Some error:", err);
  }
  console.log("Server is working.");
});
