import React, { useState, useRef } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Camera } from "lucide-react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AWSHelper from "../../../../../services/aws";
import { register } from "../../../../../apis/user.api";

const AddPolice = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullname: "",
    date_of_birth: "",
    gender: "",
    phone_no: "",
    password: "",
    role: "officer",
    photo: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
    policeDetails: {
      badgeNumber: "",
      rank: "",
      station: "",
      cases_solved: 0,
      cases_pending: 0,
      attendance_percentage: 0,
    },
    avaliableLeave: 20,
    usedLeave: 0,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let photoUrl = "";
      if (selectedImage) {
        photoUrl = await AWSHelper.upload(
          selectedImage,
          formData.username
        );
        console.log(photoUrl);
      }
      const formattedDate = new Date(formData.date_of_birth).toISOString();

      // Prepare the request body
      const requestBody = {
        ...formData,
        date_of_birth: formattedDate,
        photo: photoUrl,
      };

      const response = await axios.post(register, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        toast({
          title: "Success",
          description: "Officer registered successfully",
          action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
        });

        // Reset form
        setFormData({
          username: "",
          email: "",
          fullname: "",
          date_of_birth: "",
          gender: "",
          phone_no: "",
          password: "",
          role: "officer",
          photo: "",
          address: {
            street: "",
            city: "",
            state: "",
            pincode: "",
          },
          policeDetails: {
            badgeNumber: "",
            rank: "",
            station: "",
            cases_solved: 0,
            cases_pending: 0,
            attendance_percentage: 0,
          },
          avaliableLeave: 20,
          usedLeave: 0,
        });
        setSelectedImage(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Failed to register officer.";

      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (
          typeof error.response.data === "string" &&
          error.response.data.includes("Error:")
        ) {
          try {
            errorMessage = error.response.data.split("Error: ")[1].split("<br>")[0];
          } catch (e) {
            errorMessage = error.response.data;
          }
        }
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Police Officer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div
                className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>
            </div>
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  placeholder="Enter full name"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  placeholder="Enter username"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="Enter email address"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="Enter password"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  onValueChange={(value) => handleSelectChange(value, "gender")}
                  value={formData.gender}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_no">Phone Number</Label>
                <Input
                  id="phone_no"
                  name="phone_no"
                  value={formData.phone_no}
                  placeholder="Enter phone number"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label>Address</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="address.street"
                  value={formData.address.street}
                  placeholder="Street"
                  onChange={handleChange}
                  required
                />
                <Input
                  name="address.city"
                  value={formData.address.city}
                  placeholder="City"
                  onChange={handleChange}
                  required
                />
                <Input
                  name="address.state"
                  value={formData.address.state}
                  placeholder="State"
                  onChange={handleChange}
                  required
                />
                <Input
                  name="address.pincode"
                  value={formData.address.pincode}
                  placeholder="Pincode"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Police Details */}
            <div className="space-y-2">
              <Label>Police Details</Label>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  name="policeDetails.badgeNumber"
                  value={formData.policeDetails.badgeNumber}
                  placeholder="Badge Number"
                  onChange={handleChange}
                  required
                />
                <Input
                  name="policeDetails.rank"
                  value={formData.policeDetails.rank}
                  placeholder="Rank"
                  onChange={handleChange}
                  required
                />
                <Input
                  name="policeDetails.station"
                  value={formData.policeDetails.station}
                  placeholder="Station"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Case Statistics */}
            <div className="space-y-2">
              <Label>Case Statistics</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cases_solved">Cases Solved</Label>
                  <Input
                    id="cases_solved"
                    name="policeDetails.cases_solved"
                    type="number"
                    value={formData.policeDetails.cases_solved}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cases_pending">Cases Pending</Label>
                  <Input
                    id="cases_pending"
                    name="policeDetails.cases_pending"
                    type="number"
                    value={formData.policeDetails.cases_pending}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance_percentage">Attendance (%)</Label>
                  <Input
                    id="attendance_percentage"
                    name="policeDetails.attendance_percentage"
                    type="number"
                    value={formData.policeDetails.attendance_percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) => handleSelectChange(value, "role")}
                value={formData.role}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="officer">Officer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Add Officer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddPolice;
