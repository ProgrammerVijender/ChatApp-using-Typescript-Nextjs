import { Server , Socket } from 'socket.io';

import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server , {
    cors: {
        origin: '*',
        methods:['GET , POST'],
    }
});


const userSocketMap: Record <string, string> = {};

io.on('connection' , (socket : Socket) => {
    console.log('User connected : ', socket.id);

    const userId = socket.handshake.query.userId as string | undefined;

    // if(userId) return;

    if(userId && userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    } 

    io.emit('getOnlineUser', Object.keys(userSocketMap));


    socket.on("disconnect" , () => {
        // userSocketMap[userId] = socket.id;
        console.log(`User disconnected: ${socket.id}`);
    });


    if(userId && userId !== 'undefined') {
        delete userSocketMap[userId];
        console.log(`User ${userId} disconnected and removed from userSocketMap`);
        io.emit("getOnlineUser", Object.keys(userSocketMap));
    }

    socket.on('connection_error' , (error) => {

        console.log('Socket connection error:', error);

    });
});


export {app,server, io};