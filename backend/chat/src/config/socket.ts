import { Server, Socket } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

const userSocketMap: Record<string, string> = {};

io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string | undefined;

    if (userId && userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} connected: ${socket.id}`);
    }

    io.emit('getOnlineUser', Object.keys(userSocketMap));

    if(userId){
        socket.join(userId);
    }

    socket.on('typing', (data) => {

        console.log(`User ${data.userId} is typing in chat ${data.chatId}`);
        socket.to(data.chatId).emit('userTyping', {
            chatId: data.chatId,
            userId: data.userId,
        });
    });

    socket.on('stopTyping', (data) => {
        console.log(`User ${data.userId} is typing in chat ${data.chatId}`);
        socket.to(data.chatId).emit('userStoppedTyping', {
            chatId: data.chatId,
            userId: data.userId,
        });
    });

    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
        console.log(`User ${userId} joined chat ${chatId}`);
    });

    socket.on("leaveChat", (chatId) => {
        socket.leave(chatId);
        console.log(`User ${userId} left chat room ${chatId}`);
    });

    
    

    socket.on('disconnect', () => {
        if (userId && userId !== 'undefined') {
            delete userSocketMap[userId];
            console.log(`User ${userId} disconnected`);
            io.emit('getOnlineUser', Object.keys(userSocketMap));
        }
    });
});

export { app, server, io };
