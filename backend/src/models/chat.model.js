import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        senderId:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message:{
            type: String,
            trim: true,
            default: null,
        },
        media:{
            url: { 
                type: String,
            },
            type:{
                type: String,
                enum: ["image", "video", "audio", "file"],
            },
        },
        isMedia:{
            type: Boolean,
            default: false,
        },
        sentAt:{
            type: Date,
            default: Date.now,
        },
        isRead:{
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const chatSchema = new Schema(
    {
        participants:[
            {
                userId:{
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                lastReadIndex: {
                    type: Number,
                    default: -1,
                },
                unreadCount: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        messages: {
            type: [messageSchema],
            default: [],
        },
        totalMessages: {
            type: Number,
            default: 0,
        },
        lastMessageAt:{
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);