import mongoose, { Document, Types } from "mongoose";
export interface IChat extends Document {
    users: Types.ObjectId[];
    latestMessage?: {
        text?: string;
        sender?: Types.ObjectId;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IChat, {}, {}, {}, mongoose.Document<unknown, {}, IChat, {}, mongoose.DefaultSchemaOptions> & IChat & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IChat>;
export default _default;
//# sourceMappingURL=Chat.d.ts.map