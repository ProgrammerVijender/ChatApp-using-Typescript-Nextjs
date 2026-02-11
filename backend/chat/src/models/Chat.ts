// import mongoose , { Document , Schema } from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// export interface IChat extends Document {
//     users:[string],
//     latestMessage:{
//         text:string;
//         sender:string;
//     };
//     createdAt:Date;
//     updatedAt:Date;
// }

// const schema:Schema <IChat> = new Schema({
//         users:[{
//         type: String,
//         required:true,}],
    
//         latestMessage:{
//         text:String,
//         sender:String,},
//         },
//         {
//             timestamps:true,
//         }
//     );

// export default mongoose.model<IChat>("Chat" , schema)

import mongoose, { Document, Schema, Types } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export interface IChat extends Document {
  users: Types.ObjectId[];
  latestMessage?: {
    text?: string;
    sender?: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const schema: Schema<IChat> = new Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // optional but recommended
        required: true,
      },
    ],
    latestMessage: {
      text: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IChat>("Chat", schema);