import type { NextFunction, Response , Request} from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { Document } from "mongoose";
import dotenv from "dotenv";
//  import type { IUser } from "../models/Chat.js";
// import  {IUser} from '../models/Chat.js' 

dotenv.config();


interface IUser extends Document {
    // _id: string;
    name: string;
    email: string;

}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async(req: AuthenticatedRequest, res: Response, next: NextFunction)
: Promise<void> => {
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

    const decodedValue = jwt.verify(
      token as string ,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // console.log('decoded : '+ decodedValue)
    
    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    
    
    req.user = decodedValue.user;
    console.log('decoded value : '  + JSON.stringify(decodedValue.user));
    

    console.log('Auth passed');
    next();
  } catch (error) {
    res.status(401).json({ message: "JWT error" });
  }
}

