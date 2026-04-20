import TryCatch from "../config/TryCatch.js";
import Chat from "../models/Chat.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import Messages from "../models/Messages.js";
import axios from "axios";
// import User from "../models/user.js";

import mongoose from "mongoose";

// const chatObjectId = new mongoose.Types.ObjectId(chatId) as object;
// const userObjectId = new mongoose.Types.ObjectId(userId);

export const createNewChat = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;
    
    if (!otherUserId) {
      console.log('o id not found ')
      res.status(400).json({
        message: "Other userid is required",
      });
      return;
    }
    console.log("userid :- " + userId)
    console.log('otherid :- ' + otherUserId)

    const existingChat = await Chat.findOne({
      users: { $all: [userId, otherUserId], $size: 2 },

    }).lean();


    if (existingChat) {
      res.json({
        message: "Chat already exists",
        chatId: existingChat._id,
      });
      return;
    }

    const newChat = await Chat.create({
      users: [userId, otherUserId],
    });

    res.status(201).json({
      message: "Chat created successfully",
      chatId: newChat._id,
    });
  },
);
// import mongoose from "mongoose";

// export const createNewChat = TryCatch(
//   async (req: AuthenticatedRequest, res) => {
//     const userId = req.user?._id;
//     const { otherUserId } = req.body;

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (!otherUserId) {
//       return res.status(400).json({
//         message: "Other userId is required",
//       });
//     }

//     const userObjectId = new mongoose.Types.ObjectId(userId);
//     const otherUserObjectId = new mongoose.Types.ObjectId(otherUserId);

//     const existingChat = await Chat.findOne({
//       users: {
//         $all: [userObjectId, otherUserObjectId],
//         $size: 2,
//       },
//     });

//     if (existingChat) {
//       return res.json({
//         message: "Chat already exists",
//         chatId: existingChat._id.toString(), // always string to frontend
//       });
//     }

//     const newChat = await Chat.create({
//       users: [userObjectId, otherUserObjectId],
//     });

//     return res.status(201).json({
//       message: "Chat created successfully",
//       chatId: newChat._id.toString(),
//     });
//   }
// );

export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
  
  console.log('get all chats logged')
  const userId = req.user?._id;
  // console.log(("id is :" + userId) as string);
  if (!userId) {
    res.status(400).json({
      message: "User id is missing",
    });
    return;
  }
    // console.log(userId);
  const chats = await Chat.find({
    users: userId as any,
  }).sort({
    updatedAt: -1,
  });
  // console.log('chats ' + chats);
  // console.log(JSON.stringify(chats.users, null, 2));
  console.log(chats );
  const chatWithUserData = (
    await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.users.find(
          (id) => id.toString() !== userId.toString()
        );

        const unseenCount = await Messages.countDocuments({
          chatId: chat._id,
          sender: { $ne: userId as any },
          seen: false,
        });

        try {
          const { data } = await axios.get(
            `http://localhost:5020/api/v1/user/${otherUserId?.toString()}`
          );

          return {
            user: data,
            chat: {
              ...chat.toObject(),
              latestMessage: chat.latestMessage || null,
              unseenCount,
            },
          };
        } catch (error: any) {
          if (error?.response?.status === 404) return null;
          return {
            user: { _id: otherUserId, name: "Unknown User" },
            chat: {
              ...chat.toObject(),
              latestMessage: chat.latestMessage || null,
              unseenCount,
            },
          };
        }
      })
    )
  ).filter(Boolean);

  res.json({
    chats: chatWithUserData,
  });
});

export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
  const senderId = req.user?._id;
  const { chatId, text } = req.body;
  const imageFile = req.file;

  if (!senderId) {
    res.status(400).json({
      message: "Sender id is missing",
    });
    return;
  }

  if (!chatId) {
    res.status(400).json({
      message: "Chat id is missing , ChatId Required",
    });
    return;
  }

  if (!mongoose.isValidObjectId(chatId)) {
    res.status(400).json({
      message: "Invalid chat id",
    });
    return;
  }

  if (!text && !imageFile) {
    res.status(400).json({
      message: "Text or image is required",
    });
    return;
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404).json({
      message: "Chat not found",
    });
    return;
  }

  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === senderId.toString(),
  );

  if (!isUserInChat) {
    res.status(403).json({
      message: "You are not a participant of this chat",
    });
    return;
  }

  const otherUserId = chat.users.find(
    (userId) => userId.toString() !== senderId.toString(),
  );

  if (!otherUserId) {
    res.status(401).json({
      message: "No other user found in this chat",
    });
    return;
  }

  // socket setup krre h idhar

  let messageData: any = {
    chatId: chat._id,
    sender: senderId,
    seen: false,
    seenAt: undefined,
  };

  if (imageFile) {
    messageData.image = {
      url: imageFile.path,
      publicId: imageFile.filename,
    };

    messageData.messageType = "image";
    messageData.text = text || "";
  } else {
    messageData.text = text;
    messageData.messageType = "text";
  }

  const message = new Messages(messageData);

  const savedMessage = await message.save();

  const latestMessageInfo = imageFile ? " 📷 Image" : text;

  await Chat.findByIdAndUpdate(
    chatId,
    {
      latestMessage: {
        text: latestMessageInfo,
        sender: senderId,
      },
      updatedAt: new Date(),
    },
    {
      new: true,
    },
  );

  // emit to socket io here
  res.status(201).json({
    message: savedMessage,
    sender: senderId,
  });
});

export const getMessagesByChat = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { chatId } = req.params;
      

    if (!userId) {
      res.status(400).json({
        message: "Chat id Required",
      });
      return;
    }

    if (!mongoose.isValidObjectId(chatId)) {
      res.status(400).json({
        message: "Invalid chat id",
      });
      return;
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404).json({
        message: "Chat not found",
      });
      return;
    }

    const isUserInChat = chat.users.some(
      (id) => id.toString() === userId.toString(),
    );

    if (!isUserInChat) {
      res.status(403).json({
        message: "You are not a participant of this chat",
      });
      return;
    }
    // const messageToMarkSeen = await Messages.find(
    //     {
    //         chatId: chatId,
    //         sender: { $ne: userId as any},
    //         seen: false,
    //     }
    // );
    const messageToMarkSeen = await Messages.find({
      chatId: chat._id,
      sender: { $ne: userId as any },
      seen: false,
    });

    await Messages.updateMany(
      {
        chatId: chat._id,
        sender: { $ne: userId as any },
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      },
    );

    const messages = await Messages.find({ chatId: chat._id }).sort({ createdAt: 1 });

    const otherUserId = chat.users.find(
      (id) => id.toString() !== userId.toString(),
    );

    if (!otherUserId) {
      res.status(400).json({
        message: "No Other user",
      });
      return;
    }

    try {
      const { data } = await axios.get(
        `http://localhost:5020/api/v1/user/${otherUserId}`,
      );
      
      res.json({
        messages: messages,
        user: data,
      });
    } catch (error) {
      console.log(error);
      res.json({
        messages: messages,
        user: { _id: otherUserId, name: "Unknown User" },
      });
    }
  },
);
