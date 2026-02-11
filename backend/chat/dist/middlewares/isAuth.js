import jwt, {} from 'jsonwebtoken';
import { Document } from "mongoose";
import dotenv from "dotenv";
//  import type { IUser } from "../models/Chat.js";
// import  {IUser} from '../models/Chat.js' 
dotenv.config();
export const isAuth = async (req, res, next) => {
    try {
        // console.log('mkc 1')
        const authHeader = req.headers.authorization;
        // console.log('mkc 2')
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // console.log('mkc 3')
            res.status(401).json({ message: "Please login - No auth header" });
            return;
        }
        // console.log('mkc 4')
        const token = authHeader.split(" ")[1];
        // console.log('receiving token ' + token);
        const decodedValue = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('decoded : '+ decodedValue)
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        req.user = decodedValue.user;
        console.log('decoded value : ' + JSON.stringify(decodedValue.user));
        console.log('Auth passed');
        next();
    }
    catch (error) {
        res.status(401).json({ message: "JWT error" });
    }
};
//# sourceMappingURL=isAuth.js.map