import SERVER_API from "./server.api.js";

export const sendMessage = `${SERVER_API}/chats/send-message`;
export const getChatById = `${SERVER_API}/chats/chat`;
export const getChats = `${SERVER_API}/chats/get-chats`;
export const markAsRead = `${SERVER_API}/chats/mark-as-read`;