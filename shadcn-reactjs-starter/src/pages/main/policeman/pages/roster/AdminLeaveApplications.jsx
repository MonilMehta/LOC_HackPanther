import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const AdminLeaveApplications = () => {
  const [leaves, setLeaves] = useState([]);
  const [notification, setNotification] = useState(null);

  // Fetch all leave applications
  const fetchLeaves = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/leave/getAllLeaves");
      const data = await res.json();
      if(data.success) {
        setLeaves(data.data);
      } else {
        setNotification({ type: "error", message: "Failed to fetch leaves" });
      }
    } catch (error) {
      setNotification({ type: "error", message: error.message });
      console.error("Error fetching leaves:", error);
    }
  };

  // Approve a leave application
  const handleApprove = async (leaveId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/leave/approveLeave/${leaveId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if(data.success) {
        setNotification({ type: "success", message: "Leave approved successfully" });
        fetchLeaves(); // Refresh the list
      } else {
        setNotification({ type: "error", message: data.message || "Approval failed" });
      }
    } catch (error) {
      setNotification({ type: "error", message: error.message });
      console.error("Error approving leave:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 max-w-5xl mx-auto p-6">
      <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-blue-600 px-4 py-2">
          <CardTitle className="text-white text-xl font-semibold">Leave Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
          {notification && (
            <Alert variant={notification.type === "success" ? "default" : "destructive"}>
              {notification.message}
            </Alert>
          )}
          {leaves.length === 0 ? (
            <p className="text-center text-gray-600">No leave applications found.</p>
          ) : (
            leaves.map((leave) => (
              <div key={leave._id} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-md transition duration-200 flex flex-col md:flex-row md:justify-between items-start gap-4">
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">Officer:</span> {leave.officer?.fullname || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Type:</span> {leave.type}
                  </p>
                  <p>
                    <span className="font-semibold">Period:</span> {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Reason:</span> {leave.reason}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span> {leave.status}
                  </p>
                </div>
                {leave.status !== "approved" && (
                  <Button onClick={() => handleApprove(leave._id)} className="bg-green-500 hover:bg-green-600 text-white">
                    Approve
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeaveApplications;
