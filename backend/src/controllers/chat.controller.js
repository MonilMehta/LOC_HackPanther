import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import { emitSocketEvents } from "../socket.js";

const sendMessage = asyncHandler( async ( req, res ) => {

    const { receiverId, chatId, message, media } = req.body;
    const senderId = req.user._id;

    if((!receiverId && !chatId) || (!message && !media)){
        throw new ApiError(400, "Receiver ID or Chat ID and either a message or media file are required");
    }

    let chat = null;
    let isNewChat = false;

    try{
        if(chatId){
            chat = await Chat.findById(chatId);
            if(!chat){
                throw new ApiError(404, "Chat not found");
            }
        } else if(receiverId){
            const receiver = await User.findById(receiverId);
            if(!receiver){
                throw new ApiError(404, "Receiver not found");
            }

            const receiversId = typeof receiverId === "string" ? new mongoose.Types.ObjectId(receiverId) : receiverId;

            chat = await Chat.findOne({
                "participants.userId": { $all: [senderId, receiverId] },
                "participants": { $size: 2 }
            });

            if(!chat){
                chat = await Chat.create({
                    participants:[
                        { userId: senderId },
                        { userId: receiversId }
                    ],
                    messages: [],
                    lastMessageAt: Date.now(),
                });
                isNewChat = true;

                const roomIds = chat.participants.map(p => p.userId.toString());
                emitSocketEvents.chatCreated(req.io, roomIds, chat);
            }
        }

        const newMessage = {
            senderId,
            message: message || "",
            media: media || null,
            isMedia: !!media,
            sentAt: Date.now(),
            isRead: false
        };

        chat.messages.push(newMessage);
        chat.lastMessageAt = Date.now();
        chat.totalMessages += 1;
        await chat.save();

        const participantIds = chat.participants.map(p => p.userId.toString());
        
        emitSocketEvents.messageUpdated(req.io, participantIds, {
            isNewChat: isNewChat,
            chat: isNewChat ? chat : null,
            chatId: chat._id,
            lastMessage: newMessage,
            messages: chat.messages,
            unreadCount: chat.messages.filter(msg => !msg.isRead && msg.senderId.toString() !== senderId.toString()).length
        });

        return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                newMessage,
                "Message Sent Successfully"
            )
        );
    } catch(error){
        console.error("Error in sendMessage:", error);
        throw new ApiError(500, "Error sending message");
    }
});

const getChatById = asyncHandler( async ( req, res ) => {

    const { chatId } = req.params;
    const currentUser = req.user._id;

    if(!chatId){
        throw new ApiError(400, "Chat ID is required");
    }

    const chat = await Chat.findById(chatId)
    .populate({
        path: "participants.userId",
        select: "username fullname photo",
        match: { _id: { $ne: null } }
    })
    .lean();

    if(!chat){
        throw new ApiError(404, "Chat not found");
    }

    const participant = chat.participants.find((p) => p.userId?._id.toString() === currentUser.toString());
    if(!participant) {
        throw new ApiError(403, "User is not a participant in this chat");
    }

    const lastReadIndex = participant.lastReadIndex ?? -1;
    let participantsInfo = [];
    let otherParticipant = null;

    
    otherParticipant = chat.participants.find(
        participant => participant.userId && !participant.userId._id.equals(currentUser)
    );
    if(otherParticipant?.userId){
        participantsInfo = {
            userId: otherParticipant.userId._id,
            username: otherParticipant.userId.username,
            fullName: otherParticipant.userId.fullname,
            avatar: otherParticipant.userId.photo,
        };
    }

    const sortedMessages = chat.messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                chatId: chat._id,
                chatName: otherParticipant?.userId?.fullname,
                chatProfilePic: otherParticipant?.userId?.avatar,
                participants: participantsInfo,
                messages: sortedMessages,
                lastReadIndex,
            },
            "Message Fetched Successfully"
        )
    );
});

const getChats = asyncHandler( async ( req, res ) => {

    const userId = req.user._id;

    const chats = await Chat.aggregate([
        {
            $match: {
                participants: {
                    $elemMatch: {
                        userId: new mongoose.Types.ObjectId(userId),
                    },
                },
            },
        },
        {
            $addFields: {
                currentUser: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$participants",
                                as: "participant",
                                cond: {
                                    $eq: ["$$participant.userId", new mongoose.Types.ObjectId(userId)],
                                },
                            },
                        },
                        0,
                    ],
                },
            },
        },
        {
            $addFields: {
                unreadMessages: {
                    $filter: {
                        input: {
                            $slice: [
                                "$messages",
                                { $add: ["$currentUser.lastReadIndex", 1] },
                                { $max: [1, { $subtract: ["$totalMessages", { $add: ["$currentUser.lastReadIndex", 1] }] }] },
                            ],
                        },
                        as: "message",
                        cond: {
                            $ne: ["$$message.senderId", new mongoose.Types.ObjectId(userId)], // Exclude messages sent by current user
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                unreadCount: { $size: "$unreadMessages" }
            }
        },
        {
            $addFields: {
                lastMessage: { $arrayElemAt: ["$messages", -1] },
                chatDetails: {
                    $cond: {
                        if: { $eq: ["$isGroup", true] },
                        then: {
                            groupName: "$groupName",
                            groupProfilePic: "$groupProfilePic",
                        },
                        else: {
                            participant: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$participants",
                                            as: "participant",
                                            cond: {
                                                $ne: ["$$participant.userId", new mongoose.Types.ObjectId(userId)],
                                            },
                                        },
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                },
            },
        },
        {
            $lookup: {
                from: "users", 
                localField: "chatDetails.participant.userId",
                foreignField: "_id",
                as: "participantDetails",
            },
        },
        {
            $addFields: {
                participantDetails: {
                    $arrayElemAt: ["$participantDetails", 0],
                },
            },
        },
        {
            $project: {
                _id: 1,
                chatDetails: 1,
                lastMessage: 1,
                unreadCount: 1,
                totalMessages: 1,
                "participantDetails.username": 1,
                "participantDetails.fullname": 1,
                "participantDetails.photo": 1,
                "participantDetails.email": 1,
                "participantDetails.phone_no": 1,
                "participantDetails.policeDetails.rank": 1,
                "participantDetails.policeDetails.station": 1,
            },
        },
        {
            $sort: {
                "lastMessage.sentAt": -1,
            },
        },
    ]);
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            chats,
            "Chats fetched successfully"
        )
    )
});

const markAsRead = asyncHandler( async ( req, res ) => {

    const { chatId } = req.body;
    const userId = req.user._id;

    if(!chatId){
        throw new ApiError(400, "Chat ID is required");
    }

    const chat = await Chat.findById(chatId);
    if(!chat){
        throw new ApiError(404, "Chat not found");
    }

    const participant = chat.participants.find((p) => p.userId.toString() === userId.toString());
    if(!participant){
        throw new ApiError(403, "User is not a participant in this chat");
    }

    const lastReadIndex = participant.lastReadIndex ?? -1;
    let updated = false;

    chat.messages.forEach((msg, index) => {
        if(index > lastReadIndex && msg.senderId.toString() !== userId.toString()){
            if(!msg.isRead){
                msg.isRead = true;
            }
            updated = true;
        }
    });

    const participantIndex = chat.participants.findIndex((p) => p.userId.toString() === userId.toString());
    chat.participants[participantIndex].lastReadIndex = chat.messages.length - 1;
    
    await chat.save();
    
    if(updated){
        const otherParticipantIds = chat.participants.map((p) => p.userId.toString()).filter((id) => id !== userId.toString());

        emitSocketEvents.messageRead(req.io, otherParticipantIds, {
            chatId: chat._id,
            userId: userId.toString(),
            isGroup: chat.isGroup,
        });
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Messages marked as read successfully" 
        )
    );
});


export { sendMessage, getChatById, getChats, markAsRead };