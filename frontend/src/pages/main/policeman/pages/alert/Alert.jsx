import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Image as ImageIcon,
  X,
  Plus,
  AlertCircle,
  Share2,
  InboxIcon,
} from "lucide-react";
import AWSHelper from "../../../../../services/aws";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Badge } from "@/components/ui/badge"; // Add this import

// Move styles to a separate CSS file or add to your global CSS
import "./Alert.css"; // Create this file if needed

const AlertComponent = () => {
  const [alerts, setAlerts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cookies] = useCookies(["id"]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        "http://localhost:8000/api/alert/getAlert"
      );
      setAlerts(response?.data?.alert || []);
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch alerts"
      );
      console.error("Error fetching alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please upload only image files");
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !date.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = "";
      if (image) {
        imageUrl = await AWSHelper.upload(image, cookies.id);
      }
      //console.log(title);
      //console.log(description);
      console.log(imageUrl);
      const response = await axios.post(
        "http://localhost:8000/api/alert/sendAlert",
        {
          title,
          description,
          imageUrl,
          date,
        }
      );

      if (response?.data?.newAlert) {
        setAlerts((prevAlerts) => [response.data.newAlert, ...prevAlerts]);

        // Reset form
        setTitle("");
        setDescription("");
        setDate("");
        setImage(null);
        setImagePreview(null);
        setIsDialogOpen(false);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to create alert"
      );
      console.error("Error posting alert:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setError(null);
    setTitle("");
    setDescription("");
    setDate("");
    setImage(null);
    setImagePreview(null);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error("Invalid date");

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section with Enhanced Styling */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Police Alerts Dashboard
          </h1>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-black hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Alert
                </span>
              </Button>
            </DialogTrigger>

            {/* Enhanced Dialog Content */}
            <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter alert title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Alert details"
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image</Label>
                  <div className="mt-1 space-y-2">
                    {!imagePreview ? (
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="text-sm text-gray-500">
                              Click to upload image
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                          <Input
                            id="image"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="relative w-full">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-black hover:bg-gray-800"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Alert"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 animate-slideDown">
            <AlertDescription className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!isLoading ? (
            alerts.length > 0 ? (
              alerts.map((alert) => (
                <Card
                  key={alert._id}
                  className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0"
                >
                  <CardHeader className="bg-gradient-to-br from-gray-50 to-white pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {alert.title}
                      </CardTitle>
                      <span className="text-xs text-gray-500">
                        {formatDate(alert.date)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {alert.imageUrl && (
                      <div className="relative overflow-hidden rounded-lg group">
                        <img
                          src={alert.imageUrl}
                          alt={alert.title}
                          className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
                      </div>
                    )}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Alert</Badge>
                        <span className="text-sm text-gray-500">
                          #{alert._id?.slice(-4)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-100"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-md">
                <InboxIcon className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  No alerts available
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Create your first alert to get started
                </p>
              </div>
            )
          ) : (
            <div className="col-span-full flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Loading State with Better Visual */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
              <p className="text-lg font-medium">Loading alerts...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertComponent;
