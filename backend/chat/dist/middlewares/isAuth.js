import jwt, {} from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Please login - No auth header" });
            return;
        }
        const token = authHeader.split(" ")[1];
        // console.log('receiving token ' + token);
        const decodedValue = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('decoded : '+ decodedValue)
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        req.user = decodedValue.user;
        // console.log('decoded value : '  + JSON.stringify(decodedValue.user));
        // console.log('Auth passed');
        next();
    }
    catch (error) {
        res.status(401).json({ message: "JWT error" });
    }
};
//# sourceMappingURL=isAuth.js.map