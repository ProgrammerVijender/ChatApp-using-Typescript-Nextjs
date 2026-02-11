import jwt, {} from 'jsonwebtoken';
export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // console.log('token ' + authHeader);
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Please login - No auth header" });
            return;
        }
        const token = authHeader.split(" ")[1];
        // console.log('token ' + token);
        const decodedValue = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('decoded value : '+decodedValue);
        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        req.user = decodedValue.user;
        next();
    }
    catch (error) {
        // console.log('Auth called');
        res.status(401).json({ message: "JWT error" });
    }
};
export default isAuth;
//# sourceMappingURL=isAuth.js.map