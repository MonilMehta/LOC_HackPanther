import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

const SOSComponent = ({ userId, userName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sosAlerts, setSOSAlerts] = useState([]);

  const sendSOS = async () => {
    setIsLoading(true);
    try {
      // Get location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch('http://localhost:8000/api/sos/sendSOS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) throw new Error('Failed to send SOS');

      toast({
        title: "SOS Sent",
        description: "Emergency services have been notified of your location.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error sending SOS:', error);
      toast({
        title: "Error",
        description: "Failed to send SOS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for incoming SOS alerts
  useEffect(() => {
    // You would implement your real-time notification system here
    // This is just a placeholder for demonstration
    const handleIncomingSOS = (sosData) => {
      setSOSAlerts(prev => [sosData, ...prev]);
    };

    // Clean up subscription when component unmounts
    return () => {
      // Cleanup notification listeners
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* SOS Button for citizens */}
      <Button 
        variant="destructive"
        className="w-full gap-2"
        onClick={sendSOS}
        disabled={isLoading}
      >
        <AlertCircle className="h-5 w-5" />
        {isLoading ? "Sending SOS..." : "Send SOS"}
      </Button>

      {/* SOS Alerts for officers/admin */}
      <div className="space-y-2">
        {sosAlerts.map((alert, index) => (
          <Alert variant="destructive" key={index}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Emergency SOS</AlertTitle>
            <AlertDescription>
              <p className="font-semibold">{alert.userName}</p>
              <p className="text-sm">
                Location: {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
};

export default SOSComponent;