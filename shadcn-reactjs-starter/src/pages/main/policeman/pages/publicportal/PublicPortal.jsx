import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { MessageSquare, FileText } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import axios from "axios";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const PublicPortal = () => {
  const [cookies] = useCookies(["role"]);
  const role = cookies.role || "citizen";
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [chatRequests, setChatRequests] = useState([
    { id: 1, message: "Need help with filing a report." },
    { id: 2, message: "Query about local regulations." },
  ]);

  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (role === "admin") {
      fetch("/api/officers")
        .then((response) => response.json())
        .then((data) => setOfficers(data))
        .catch((error) => console.error("Error fetching officers:", error));
    }
  }, [role]);

  const callGeminiAPI = async (userInput) => {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: userInput,
                },
              ],
            },
          ],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    try {
      setIsLoading(true);
      setChatMessages((prev) => [...prev, { sender: "user", text: chatInput }]);

      const response = await callGeminiAPI(chatInput);

      setChatMessages((prev) => [...prev, { sender: "bot", text: response }]);
      setChatInput("");
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  };

  const handleOpenChat = (chatId) => {
    setSelectedChat(chatId);
    fetch(`/api/chats/${chatId}`)
      .then((response) => response.json())
      .then((data) => setChatMessages(data.messages))
      .catch((error) => console.error("Error fetching chat messages:", error));
  };

  const handleRequestOfficerSupport = () => {
    const summary = chatMessages
      .map((msg) => `${msg.sender}: ${msg.text}`)
      .join("\n");
    setChatRequests((prev) => [
      ...prev,
      { id: chatRequests.length + 1, message: summary },
    ]);
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: "I've requested officer support for you. An officer will review your chat and respond as soon as possible.",
      },
    ]);
  };

  const handleConvertToCase = (reportId) => {
    navigate(`/main/cases/CaseAction?reportId=${reportId}`);
  };

  const handleAssignCase = (reportId) => {
    if (!selectedOfficer) {
      alert("Please select an officer first.");
      return;
    }
    alert(
      `Case with Report ID ${reportId} assigned to Officer ID ${selectedOfficer}.`
    );
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/report/getReport", // Updated endpoint URL with /api prefix
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Fetched reports:", response.data);

      // Handle the response data properly
      if (response.data && Array.isArray(response.data)) {
        setReports(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setReports(response.data.data);
      } else {
        console.error("Unexpected data format:", response.data);
        setReports([]);
      }
    } catch (error) {
      console.error(
        "Error fetching reports:",
        error.response?.data || error.message
      );
      setReports([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchReports();
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const formatDateTime = (date, time) => {
    const formattedDate = new Date(date).toLocaleDateString();
    return `${formattedDate} at ${time}`;
  };

  const renderReportsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Submitted Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No reports found
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="p-4 rounded-lg bg-muted">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(report.date, report.time)}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm capitalize">
                      {report.type_of_crime}
                    </span>
                  </div>

                  <p className="text-sm">{report.description}</p>

                  <div className="text-sm text-muted-foreground">
                    <p>
                      Location: {report.location.street}, {report.location.city}
                      , {report.location.state} - {report.location.pincode}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleConvertToCase(report._id)}
                    >
                      Convert to Case
                    </Button>
                    {role === "admin" && (
                      <div className="flex gap-2">
                        <Select
                          value={selectedOfficer}
                          onValueChange={setSelectedOfficer}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Officer" />
                          </SelectTrigger>
                          <SelectContent>
                            {officers.map((officer) => (
                              <SelectItem key={officer.id} value={officer.id}>
                                {officer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="secondary"
                          onClick={() => handleAssignCase(report._id)}
                        >
                          Assign Officer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Public Portal</h1>

      {role === "citizen" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] mb-4 p-4 rounded-lg border">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={handleSendChat} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send"}
              </Button>
              <Button
                variant="outline"
                onClick={handleRequestOfficerSupport}
                disabled={isLoading}
              >
                Request Officer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(role === "officer" || role === "admin") && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Open Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chatRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg bg-muted cursor-pointer hover:bg-muted/80"
                    onClick={() => handleOpenChat(request.id)}
                  >
                    <p>{request.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedChat && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat with User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] mb-4 p-4 rounded-lg border">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={handleSendChat}>Send</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {renderReportsSection()}
        </div>
      )}
    </div>
  );
};

export default PublicPortal;
