import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const DutyRoster = () => {
  const [cookies] = useCookies(["role", "id"]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState("morning");
  const isAdmin = cookies.role === "admin";
  const officerId = cookies.id;
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);

  // Sample data for officers in different shifts
  const shiftOfficers = {
    morning: [
      { id: 1, name: "John Smith", rank: "Sergeant", badge: "B123" },
      { id: 2, name: "Sarah Johnson", rank: "Officer", badge: "B124" },
      { id: 3, name: "Mike Wilson", rank: "Officer", badge: "B125" },
    ],
    evening: [
      { id: 4, name: "Emily Brown", rank: "Sergeant", badge: "B126" },
      { id: 5, name: "David Lee", rank: "Officer", badge: "B127" },
      { id: 6, name: "Lisa Anderson", rank: "Officer", badge: "B128" },
    ],
    night: [
      { id: 7, name: "James Taylor", rank: "Sergeant", badge: "B129" },
      { id: 8, name: "Robert Martinez", rank: "Officer", badge: "B130" },
      { id: 9, name: "Patricia White", rank: "Officer", badge: "B131" },
    ],
  };

  // Fetch attendance history from API
  const fetchAttendance = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/attendance/getAttendance");
      const data = await response.json();
      setAttendanceHistory(data.data.filter(record => record.officer && record.officer._id === officerId)); // Filter by officer ID
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  // Fetch leave history from API
  const fetchLeaveHistory = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/leave/getLeave");
      const data = await response.json();
      setLeaveHistory(data.data.filter(leave => leave.officer && leave.officer._id === officerId)); // Filter by officer ID
    } catch (error) {
      console.error("Error fetching leave history:", error);
    }
  };

  // Leave submission handler for the LeaveRequestForm
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      officer: officerId,
      type: formData.get("leaveType"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      reason: formData.get("reason")
    };
    try {
      const res = await fetch("http://localhost:8000/api/leave/applyLeave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to apply for leave");
      fetchLeaveHistory();
      setShowLeaveForm(false);
    } catch (error) {
      console.error("Error applying for leave:", error);
    }
  };

  // Fetch attendance and leave data on component mount
  useEffect(() => {
    fetchAttendance();
    fetchLeaveHistory();
  }, []);

  const LeaveRequestForm = () => (
    <form onSubmit={handleLeaveSubmit} className="space-y-6 p-4">
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Leave Type
        </label>
        <Select name="leaveType">
          <SelectTrigger className="w-full border-2 hover:border-black-400 transition-colors">
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sick">Sick Leave</SelectItem>
            <SelectItem value="annual">Annual Leave</SelectItem>
            <SelectItem value="personal">Personal Leave</SelectItem>
            <SelectItem value="emergency">Emergency Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Start Date
          </label>
          <Input
            type="date"
            name="startDate"
            className="w-full border-2 hover:border-black-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            End Date
          </label>
          <Input
            type="date"
            name="endDate"
            className="w-full border-2 hover:border-black-400 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Reason
        </label>
        <Input
          as="textarea"
          name="reason"
          className="w-full h-32 border-2 hover:border-black-400 transition-colors resize-none"
          placeholder="Please provide a reason for your leave request..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => setShowLeaveForm(false)}>
          Cancel
        </Button>
        <Button type="submit">
          Submit Request
        </Button>
      </div>
    </form>
  );

  const ShiftManagementForm = () => (
    <div className="space-y-6 p-4">
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Officer
        </label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select officer" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(shiftOfficers)
              .flat()
              .map((officer) => (
                <SelectItem key={officer.id} value={officer.id.toString()}>
                  {officer.name} - {officer.badge}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          New Shift
        </label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">Morning Shift</SelectItem>
            <SelectItem value="evening">Evening Shift</SelectItem>
            <SelectItem value="night">Night Shift</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => setShowShiftForm(false)}>
          Cancel
        </Button>
        <Button className="bg-primary">Update Shift</Button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50">
      <Tabs defaultValue="shift-roster" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-lg">
          <TabsTrigger
            value="shift-roster"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Shift Roster
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
          >
            Attendance & Leave
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shift-roster">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-black-50 to-black-100 rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-3 text-black-800">
                  <Clock className="h-5 w-5" />
                  Current Shift Officers
                </CardTitle>
                {isAdmin && (
                  <Dialog open={showShiftForm} onOpenChange={setShowShiftForm}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Manage Shifts</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modify Officer Shift</DialogTitle>
                        <DialogDescription>
                          Reassign officers to different shifts
                        </DialogDescription>
                      </DialogHeader>
                      <ShiftManagementForm />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <CardDescription className="text-black-600">
                View officers assigned to each shift
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setSelectedShift("morning")}
                    className={`flex-1 ${
                      selectedShift === "morning"
                        ? "bg-black-600"
                        : "bg-gray-200 text-black-700"
                    }`}
                  >
                    Morning Shift
                  </Button>
                  <Button
                    onClick={() => setSelectedShift("evening")}
                    className={`flex-1 ${
                      selectedShift === "evening"
                        ? "bg-black-600"
                        : "bg-gray-200 text-black-700"
                    }`}
                  >
                    Evening Shift
                  </Button>
                  <Button
                    onClick={() => setSelectedShift("night")}
                    className={`flex-1 ${
                      selectedShift === "night"
                        ? "bg-black-600"
                        : "bg-gray-200 text-black-700"
                    }`}
                  >
                    Night Shift
                  </Button>
                </div>

                <div className="space-y-4">
                  {shiftOfficers[selectedShift].map((officer) => (
                    <div
                      key={officer.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-gray-700">
                          {officer.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {officer.rank}
                        </div>
                      </div>
                      <div className="bg-black-100 px-4 py-2 rounded-full text-black-800 text-sm">
                        Badge: {officer.badge}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-green-800">
                  <Users className="h-5 w-5" />
                  Attendance History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {attendanceHistory.map((record, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                        <span className={`px-4 py-1 rounded-full text-sm font-medium ${record.status === "present" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-2 bg-white p-2 rounded-lg">
                        {record.shift} | In: {record.in_time} | Out: {record.out_time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-orange-800">
                  <CalendarIcon className="h-5 w-5" />
                  Leave Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 display-flex justify-center">
                <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
                  <DialogTrigger asChild>
                    <Button >
                      Request Leave
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Submit Leave Request</DialogTitle>
                      <DialogDescription>
                        Fill in the details for your leave request
                      </DialogDescription>
                    </DialogHeader>
                    <LeaveRequestForm />
                  </DialogContent>
                </Dialog>

                <div className="space-y-6">
                  <div className="text-sm font-semibold mb-3 text-gray-700">
                    Recent Requests
                  </div>
                  <div className="space-y-3">
                    {leaveHistory.map((leave, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">
                            {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm ${leave.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {leave.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DutyRoster;