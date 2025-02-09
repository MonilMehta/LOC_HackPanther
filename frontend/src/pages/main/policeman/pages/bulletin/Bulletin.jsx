import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, Bell, Shield, Car, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const Bulletin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bulletins, setBulletins] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newBulletin, setNewBulletin] = useState({
    title: "",
    content: "",
    type: "general",
    priority: "normal",
  });

  // Fetch bulletins on component mount
  useEffect(() => {
    fetchBulletins();
  }, []);

  const fetchBulletins = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/bulletin/getBulletin');
      console.log('Fetched bulletins:', response.data);
      
      // Extract the bulletins array from the response
      const bulletinData = response.data.bulletin || [];
      
      setBulletins(bulletinData);
    } catch (error) {
      console.error("Error fetching bulletins:", error);
      setError("Failed to load bulletins. " + (error.response?.data?.message || error.message));
      setBulletins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: newBulletin.title,
        type: newBulletin.type.charAt(0).toUpperCase() + newBulletin.type.slice(1),
        content: newBulletin.content,
        priority: newBulletin.priority.charAt(0).toUpperCase() + newBulletin.priority.slice(1),
        date: new Date().toISOString(),
      };

      await api.post('/bulletin/createBulletin', payload);
      
      // Refresh the bulletins list after successful creation
      await fetchBulletins();

      // Reset form
      setNewBulletin({
        title: "",
        content: "",
        type: "general",
        priority: "normal",
      });

      setSuccess("Bulletin posted successfully!");
    } catch (error) {
      console.error("Error creating bulletin:", error);
      setError(error.response?.data?.message || "Failed to post bulletin. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bulletinTemplates = {
    traffic: "Road closure/construction at [LOCATION]. Expected duration: [TIME]. Please use alternate routes.",
    emergency: "Emergency situation reported at [LOCATION]. Please avoid the area and follow official instructions.",
    community: "Community event: [EVENT] scheduled for [DATE] at [LOCATION]. All residents welcome.",
    crime: "Recent [INCIDENT] reported in [AREA]. Residents advised to [SAFETY MEASURES].",
  };

  const handleTemplateSelect = (template) => {
    setNewBulletin(prev => ({
      ...prev,
      content: bulletinTemplates[template] || "",
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "high":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "traffic":
        return <Car className="h-4 w-4" />;
      case "emergency":
        return <AlertCircle className="h-4 w-4" />;
      case "community":
        return <Users className="h-4 w-4" />;
      case "crime":
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="grid md:grid-cols-[400px,1fr] gap-6">
        {/* Form Section */}
        <Card className="md:sticky md:top-6 h-fit">
          <CardHeader>
            <CardTitle>Create Bulletin</CardTitle>
            <CardDescription>Post a new community advisory or notice</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newBulletin.title}
                  onChange={(e) => setNewBulletin(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newBulletin.type}
                  onValueChange={(value) => {
                    setNewBulletin(prev => ({ ...prev, type: value }));
                    handleTemplateSelect(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="traffic">Traffic</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="crime">Crime Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newBulletin.priority}
                  onValueChange={(value) => setNewBulletin(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  className="min-h-[120px]"
                  value={newBulletin.content}
                  onChange={(e) => setNewBulletin(prev => ({ ...prev, content: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Bulletin"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bulletins Display Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-6">Recent Bulletins</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading bulletins...</div>
          ) : bulletins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No bulletins found</div>
          ) : (
            bulletins.map((bulletin) => (
              <Card key={bulletin._id} className="overflow-hidden">
                <div className={`h-1 ${
                  bulletin.priority?.toLowerCase() === "urgent" 
                    ? "bg-red-500" 
                    : bulletin.priority?.toLowerCase() === "high"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`} />
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{bulletin.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{new Date(bulletin.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {getTypeIcon(bulletin.type)}
                        {bulletin.type}
                      </Badge>
                      <Badge className={getPriorityColor(bulletin.priority)}>
                        {bulletin.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-600">{bulletin.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Bulletin;