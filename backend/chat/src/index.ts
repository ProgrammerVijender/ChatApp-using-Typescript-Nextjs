import express from "express";
import dotenv from "dotenv";
import { connect } from "mongoose";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chat.js";
import { server , app } from "./config/socket.js";

dotenv.config();

connectDB();

// const app = express();

app.use(express.json());


import cors from "cors";
import { Server } from "socket.io";

app.use(
  cors({
    origin: "http://localhost:3010",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



app.use("/api/v1" , chatRoutes);

const port = process.env.PORT ;

server.listen(port ,() =>{
    console.log(`Server is running on port ${port}`);
});