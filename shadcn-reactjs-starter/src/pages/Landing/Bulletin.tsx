import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, Bell, Shield, Car, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// TypeScript interfaces remain the same
interface Bulletin {
  _id: string;
  title: string;
  type: string;
  content: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  message: string;
  bulletin: Bulletin[];
}

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const Bulletin: React.FC = () => {
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchBulletins();
  }, []);

  const fetchBulletins = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<ApiResponse>('/bulletin/getBulletin');
      setBulletins(response.data.bulletin || []);
    } catch (error) {
      console.error("Error fetching bulletins:", error);
      setError("Failed to load bulletins.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "traffic":
        return <Car className="h-5 w-5" />;
      case "emergency":
        return <AlertCircle className="h-5 w-5" />;
      case "community":
        return <Users className="h-5 w-5" />;
      case "crime":
        return <Shield className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
          <p className="text-gray-600">Loading bulletins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center py-8 text-red-500 flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!bulletins.length) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center text-gray-500">No bulletins found</div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Community Bulletins</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay informed about important updates and announcements in your community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bulletins.map((bulletin) => (
            <Card 
              key={bulletin._id} 
              className="overflow-hidden transition-all duration-300 hover:shadow-lg border-t-4 hover:-translate-y-1"
              style={{
                borderTopColor: bulletin.priority.toLowerCase() === "urgent" 
                  ? "#EF4444" 
                  : bulletin.priority.toLowerCase() === "high" 
                  ? "#F59E0B" 
                  : "#3B82F6"
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        {getTypeIcon(bulletin.type)}
                        <span className="font-medium">{bulletin.type}</span>
                      </Badge>
                      <Badge className={`${getPriorityColor(bulletin.priority)} px-3 py-1`}>
                        {bulletin.priority}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{bulletin.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(bulletin.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 line-clamp-3">{bulletin.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};