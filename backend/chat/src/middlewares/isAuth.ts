import type { NextFunction, Response , Request} from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();


interface IUser {
    _id: string;
    name: string;
    email: string;
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async(req: AuthenticatedRequest, res: Response, next: NextFunction)
: Promise<void> => {
      try {
       
    const authHeader = req.headers.authorization;
   
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      
      res.status(401).json({ message: "Please login - No auth header" });
      return;
    }
    
    
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
    // console.log('decoded value : '  + JSON.stringify(decodedValue.user));
    

    // console.log('Auth passed');
    next();
  } catch (error) {
    res.status(401).json({ message: "JWT error" });
  }
}

