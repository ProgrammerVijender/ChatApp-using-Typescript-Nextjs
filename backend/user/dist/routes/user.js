import express from 'express';
import dotenv from 'dotenv';
import { loginUser, verifyUser, myProfile, getAllUsers, getAUser, updateName } from '../controllers/user.js';
import { isAuth } from '../middleware/isAuth.js';
dotenv.config();
const router = express.Router();
router.post('/login', loginUser);
router.post('/verify', verifyUser);
router.get('/me', isAuth, myProfile);
router.get('/user/all', isAuth, getAllUsers);
router.get('/user/:id', getAUser);
router.post('/update/user', isAuth, updateName);
export default router;
//# sourceMappingURL=user.js.map