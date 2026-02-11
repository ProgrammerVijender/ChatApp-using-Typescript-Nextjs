import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import userRoutes from './routes/user.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import cors from 'cors';
dotenv.config();
const app = express();
connectDB();
connectRabbitMQ();
export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
const port = process.env.PORT || 3000;
redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.error('Redis connection error:', err);
});
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3010",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use('/api/v1', userRoutes);
// console.log(port)
app.listen(port, () => {
    console.log(`User service is running on port- ${port}`);
});
// export default app;
//# sourceMappingURL=index.js.map