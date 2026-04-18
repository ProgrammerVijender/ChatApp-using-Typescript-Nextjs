import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import User from "../model/user.js";
import jwt from "jsonwebtoken";


export const loginUser = TryCatch(async (req, res) => {
    // console.log('dd')
    const { email } =   req.body;

    const rateLimitKey = `otp:rate-limit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);

    if (rateLimit) {
        return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, { EX: 300 });

    await redisClient.set(rateLimitKey, 'true', { EX: 60  }); // 1 minute rate limit

    const message = {
        to: email,
        subject: 'Your OTP Code',
        body: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    };

    await publishToQueue('send-otp', message);

    res.status(200).json({ message: 'OTP sent successfully', otp }); // In production, do not send OTP in response

    });


export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp:enteredOtp } = req.body;

    if (!email || !enteredOtp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp || storedOtp !== enteredOtp) {

        return res.status(400).json({ message: 'Invalid OTP or expired otp' });
    } 

    await redisClient.del(otpKey);


    
    // res.status(200).json({ message: 'User verified successfully' });

    let user = await User.findOne({ email });

    if (!user) {
    const name = email.slice(0,8); 
    user = await User.create({ email, name });
}

    const token = generateToken(user);

    res.status(200).json({ 
        message: 'User verified successfully', user, token
    });
});


export const myProfile = TryCatch( async(req:AuthenticatedRequest , res) => {
    // console.log('le betaa');
    const user = req.user;
    res.json(user);

});

export const updateName = TryCatch( async(req:AuthenticatedRequest , res) => {

    const user = await User.findById(req.user?._id);

    if (!user) {
        return res.status(404).json({ message: 'Please Login' });
    }

    user.name = req.body.name;
    await user.save();

    const token = generateToken(user);
    
    res.status(200).json({ message: 'User successfully', user, token });

});

export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {

    console.log('get all users called');

  const users = await User.find({
    _id: { $ne: req.user!._id }
  });
  

  res.status(200).json(users);
});

// export const getAUser = TryCatch( async(req:AuthenticatedRequest , res) => {
//     const user = await User.findById(req.params.id);
//     console.log(user);
//     res.status(200).json(user); 
// });

import mongoose from "mongoose";

export const getAUser = TryCatch(async (req: AuthenticatedRequest, res) => {

  const { id } = req.params;
  console.log("Requested user id:", id);

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
});
