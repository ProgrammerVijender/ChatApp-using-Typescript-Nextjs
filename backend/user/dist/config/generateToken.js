import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Types } from "mongoose";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const generateToken = (user) => {
    const generatedtoken = jwt.sign({ user }, JWT_SECRET, { expiresIn: '15d' });
    return generatedtoken;
};
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
//# sourceMappingURL=generateToken.js.map