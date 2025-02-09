import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  MoreVertical,
  Send,
  Phone,
  Video as VideoIcon,
  ChevronLeft,
  Paperclip,
  Image,
  File,
  Video,
  Clock,
  AlertTriangle,
  Shield,
  Film,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCookies } from "react-cookie";
import { socketService } from "../../../../../services/socket";
import { getUsers } from "../../../../../apis/user.api";
import {
  getChats,
  getChatById,
  sendMessage,
  markAsRead,
} from "../../../../../apis/chat.api";
import axios from "axios";
import AWSHelper from "../../../../../services/aws";

const ChatInterface = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [render, setRender] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sending, setSending] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cookies] = useCookies(["accessToken", "phone", "id"]);
  const messagesEndRef = useRef(null);

  // Fetch users from API
  const fetchData = async () => {
    try {
      setRender(false);
      const chatsResponse = await axios.get(getChats, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      console.log(chatsResponse)
      const chatUsers = chatsResponse.data.data.map((chat) => ({
        id: chat.chatDetails.participant.userId,
        name: chat.participantDetails.fullname,
        username: chat.participantDetails.username,
        avatar:
          chat.participantDetails.photo ||
          `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcZsL6PVn0SNiabAKz7js0QknS2ilJam19QQ&s`,
        lastMessage: chat.lastMessage?.message || "sent " + chat.lastMessage?.media?.type || "No messages yet",
        time: new Date(chat.lastMessage?.sentAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        station: chat.participantDetails.policeDetails.station,
        rank: chat.participantDetails.policeDetails.rank,
        unreadCount: chat.unreadCount,
        email: chat.participantDetails.email,
        phone: chat.participantDetails.phone_no,
        chatId: chat._id,
        hasExistingChat: true,
      }));

      const usersResponse = await axios.get(getUsers, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      const allUsersList = usersResponse.data.data.map((user) => ({
        id: user._id,
        name: user.fullname,
        username: user.username,
        rank: user.policeDetails.rank,
        avatar:
          user.photo ||
          `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcZsL6PVn0SNiabAKz7js0QknS2ilJam19QQ&s`,
        lastMessage: "",
        time: "",
        station: user.policeDetails.station,
        email: user.email,
        phone: user.phone_no,
        hasExistingChat: false,
      }));

      const chatUserIds = new Set(chatUsers.map((user) => user.id));
      const usersWithoutChats = allUsersList.filter(
        (user) => !chatUserIds.has(user.id) && user.phone !== cookies.phone
      );

      setLoading(false);
      setFilteredUsers(
        [...chatUsers, ...usersWithoutChats].filter((user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setRender(true);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const sortChats = useCallback((chatsToSort) => {
    return [...chatsToSort].sort((a, b) => {
      const timeA = a.lastMessage?.sentAt || a.lastMessageAt || 0;
      const timeB = b.lastMessage?.sentAt || b.lastMessageAt || 0;
      return new Date(timeB) - new Date(timeA);
    });
  }, []);

  const updateChatList = useCallback(
    (chatIds, lastMessage) => {
      setFilteredUsers((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          if (chat.id === chatIds) {
            return {
              ...chat,
              lastMessage,
              unreadCount:
                chatIds === currentChatId ? 0 : (chat.unreadCount || 0) + 1,
            };
          } else {
            return chat;
          }
        });
        console.log(updatedChats);
        return sortChats(updatedChats);
      });
    },
    [currentChatId, sortChats]
  );

  useEffect(() => {
    fetchData();
    socketService.connect(cookies.accessToken);
    const socket = socketService.getSocket();
    if (socket) {
      socketService.joinRoom(cookies.id);
      socket.on(
        "chatUpdated",
        ({ chatId, lastMessage, messages, unreadCount, isNewChat, chat }) => {
          console.log(
            "Chat update hua hai:",
            chatId,
            lastMessage,
            messages,
            unreadCount,
            isNewChat,
            chat
          );
          if (isNewChat) {
            fetchData();
            return;
          }
          updateChatList(chatId, lastMessage);
          if (chatId === currentChatId) {
            setMessages(messages);
            markMessagesAsRead(chatId);
          }
        }
      );

      socket.on("messageRead", ({ chatId, userId }) => {
        if (currentChatId === chatId && userId !== cookies.id) {
          setMessages((prevMessages) =>
            prevMessages.map((message) => ({
              ...message,
              isRead: true,
            }))
          );
        }
      });

      return () => {
        socket.off("chatCreated");
        socket.off("chatUpdated");
        socket.off("messageRead");
        socketService.disconnect();
      };
    }
  }, [cookies.id, selectedUser, currentChatId]);

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await axios.get(`${getChatById}/${chatId}`, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      console.log(response);
      const chatData = response.data.data;
      setMessages(
        chatData.messages.map((msg, index) => ({
          id: index,
          sender: msg.senderId == cookies.id ? "me" : "other",
          content: msg.message,
          time: new Date(msg.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sentAt: msg.sentAt,
          isRead: msg.isRead,
          media: msg.media,
        }))
      );
    } catch (err) {
      console.error("Error fetching chat messages:", err);
      setError("Failed to load chat messages");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setMessages([]); // Clear existing messages

    if (user.hasExistingChat) {
      setCurrentChatId(user.chatId);
      await fetchChatMessages(user.chatId);

      // Mark messages as read if there are unread messages
      if (user.unreadCount > 0) {
        await markMessagesAsRead(user.chatId);
      }
    } else {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const handleSendMessage = async (text = message) => {
    if (!text.trim() || !selectedUser || sending) return;

    try {
      setSending(true);

      const messageData = {
        receiverId: selectedUser.id,
        chatId: currentChatId,
        message: text,
      };

      setMessage(""); // Clear input immediately for better UX

      const response = await axios.post(sendMessage, messageData, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });

      console.log(response);
      if (!currentChatId && response.data.data.chatId) {
        setCurrentChatId(response.data.data.chatId);

        // Update the selected user to show they now have an existing chat
        setSelectedUser((prev) => ({
          ...prev,
          hasExistingChat: true,
          chatId: response.data.data.chatId,
        }));
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
      setMessage(text);
    } finally {
      setSending(false);
    }
  };
  const handleFileUpload = async (type) => {
    const input = document.createElement("input");
    input.type = "file";

    // Set accept attribute based on file type
    switch (type) {
      case "image":
        input.accept = "image/*";
        break;
      case "video":
        input.accept = "video/*";
        break;
      case "document":
        input.accept = ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx";
        break;
      default:
        input.accept = "*/*";
    }

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Validate file size (e.g., 100MB limit)
          const maxSize = 100 * 1024 * 1024; // 100MB in bytes
          if (file.size > maxSize) {
            throw new Error("File size exceeds 100MB limit");
          }

          // Upload to AWS and get URL
          const fileUrl = await AWSHelper.upload(file, currentChatId);

          // Send message with media
          const response = await axios.post(sendMessage, {receiverId: selectedUser.id, chatId: currentChatId, media: {url: fileUrl, type: type}}, {
            headers: {
              Authorization: `Bearer ${cookies.accessToken}`,
            },
          });

          // Update UI based on file type
          const mediaPreview =
            type === "image"
              ? `📷 Image: ${file.name}`
              : type === "video"
              ? `🎥 Video: ${file.name}`
              : type === "document"
              ? `📄 Document: ${file.name}`
              : `📎 File: ${file.name}`;
        } catch (err) {
          console.error("Error handling file:", err);
          setError(err.message || "Failed to upload file");
        }
      }
    };
    input.click();
  };

  const markMessagesAsRead = async (chatId) => {
    if (!chatId || markingAsRead) return;

    try {
      setMarkingAsRead(true);
      const response = await axios.post(
        markAsRead,
        { chatId },
        {
          headers: { Authorization: `Bearer ${cookies.accessToken}` },
        }
      );

      console.log(response);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    } finally {
      setMarkingAsRead(false);
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      const date = new Date(message.sentAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const renderDateHeader = (date) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    let displayDate = date;
    if (date === today) displayDate = "Today";
    if (date === yesterday) displayDate = "Yesterday";

    return (
      <div className="text-center my-4 text-gray-500">
        <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
          {displayDate}
        </span>
      </div>
    );
  };

  const quickResponses = [
    {
      category: "Emergency",
      icon: <AlertTriangle className="h-4 w-4" />,
      templates: [
        "Requesting immediate backup at location",
        "Suspect spotted, need assistance",
        "Emergency situation reported at scene",
        "Medical emergency, ambulance required",
      ],
    },
    {
      category: "Status Updates",
      icon: <Shield className="h-4 w-4" />,
      templates: [
        "Situation under control",
        "Area secured, proceeding with investigation",
        "Patrol completed, no incidents to report",
        "Evidence collected and documented",
      ],
    },
  ];

  const renderFileAttachmentOptions = () => (
    <PopoverContent className="w-48">
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleFileUpload("image")}
          disabled={isUploading}
        >
          <Image className="h-4 w-4 mr-2" />
          Image
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleFileUpload("video")}
          disabled={isUploading}
        >
          <Film className="h-4 w-4 mr-2" />
          Video
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleFileUpload("document")}
          disabled={isUploading}
        >
          <File className="h-4 w-4 mr-2" />
          Document
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => handleFileUpload("other")}
          disabled={isUploading}
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Other Files
        </Button>
        {isUploading && (
          <div className="px-2 py-1">
            <div className="text-xs text-gray-500 mb-1">
              Uploading... {uploadProgress}%
            </div>
            <div className="h-1 bg-gray-200 rounded">
              <div
                className="h-1 bg-blue-500 rounded"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </PopoverContent>
  );

  const renderMessageContent = (msg) => {
    if (msg.media) {
      switch (msg.media.type) {
        case "image":
          return (
            <div>
              <img
                src={msg.media.url}
                alt='image'
                className="max-w-full rounded cursor-pointer hover:opacity-90"
                onClick={() => window.open(msg.media.url, "_blank")}
              />
              <div className="mt-1 text-sm">📷</div>
            </div>
          );
        case "video":
          return (
            <div>
              <video controls className="max-w-full rounded" src={msg.media.url}>
                Your browser does not support the video tag.
              </video>
              <div className="mt-1 text-sm">🎥</div>
            </div>
          );
        case "document":
        case "other":
          return (
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80"
              onClick={() => window.open(msg.media.url, "_blank")}
            >
              <File className="h-4 w-4" />
              <span>📎</span>
            </div>
          );
        default:
          return <p>{msg.content || msg.message}</p>;
      }
    }
    return <p>{msg.content || msg.message}</p>;
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-2rem)] flex items-center justify-center">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-2rem)] flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex rounded-lg overflow-hidden border">
      {/* Users List */}
      <div
        className={`w-80 bg-white border-r ${
          selectedUser ? "hidden md:block" : "block"
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/api/placeholder/40/40" alt="PD" />
              <AvatarFallback>PD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search officers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-10rem)]">
          {render &&
            filteredUsers.map((user) => (
              <div key={user.id} onClick={() => handleUserSelect(user)}>
                {user.phone != cookies.phone && (
                  <div
                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b ${
                      selectedUser?.id === user.id ? "bg-gray-50" : ""
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium truncate">
                          {user.name}
                          {user.hasExistingChat && user.unreadCount > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              {user.unreadCount}
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {user.time}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          user.hasExistingChat && user.unreadCount > 0
                            ? "font-medium text-gray-900"
                            : "text-gray-500"
                        } truncate`}
                      >
                        {user.lastMessage}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </ScrollArea>
      </div>

      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b bg-white flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSelectedUser(null)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
              <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-medium">{selectedUser.name}</h2>
              <p className="text-sm text-gray-500">{selectedUser.role}</p>
              <p className="text-xs text-gray-400">{selectedUser.station}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4 bg-gray-50">
            <div className="space-y-4">
              <AnimatePresence>
                {Object.entries(groupMessagesByDate(messages)).map(
                  ([date, dayMessages]) => (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {renderDateHeader(date)}
                      {dayMessages.map((msg) => (
                        <div
                          key={msg.id || msg.sentAt}
                          className={`flex ${
                            msg.sender === "me" || msg.senderId === cookies.id
                              ? "justify-end"
                              : "justify-start"
                          } mb-2`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              msg.sender === "me" || msg.senderId === cookies.id
                                ? "bg-blue-500 text-white"
                                : "bg-white"
                            }`}
                          >
                            {renderMessageContent(msg)}
                            <span
                              className={`text-xs ${
                                msg.sender === "me" ||
                                msg.senderId === cookies.id
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              } float-right ml-2`}
                            >
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 bg-white border-t">
            <div className="flex gap-2 mb-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleFileUpload("image")}
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Image
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleFileUpload("video")}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleFileUpload("document")}
                    >
                      <File className="h-4 w-4 mr-2" />
                      Document
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleFileUpload("*")}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Other Files
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Clock className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    {quickResponses.map((category) => (
                      <div key={category.category}>
                        <div className="flex items-center gap-2 mb-2">
                          {category.icon}
                          <h3 className="font-medium">{category.category}</h3>
                        </div>
                        <div className="grid gap-2">
                          {category.templates.map((template) => (
                            <Button
                              key={template}
                              variant="ghost"
                              className="w-full justify-start h-auto py-2 text-sm"
                              onClick={() => handleSendMessage(template)}
                            >
                              {template}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1"
                onKeyPress={(e) =>
                  e.key === "Enter" && !sending && handleSendMessage()
                }
                disabled={sending}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={sending || !message.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-600">
              Welcome to Police Department Chat
            </h2>
            <p className="text-gray-500">
              Select an officer to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
