import express from 'express';
import dotenv from 'dotenv';
import { startSendOtpConsumer } from './consumer.js';
dotenv.config();
startSendOtpConsumer();
const app = express();
import cors from "cors";
app.use(cors({
    origin: "http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// IMPORTANT
// app.options("*", cors());
app.listen(3000, () => {
    console.log('Mail service is running...');
});
export default app;
//# sourceMappingURL=index.js.map