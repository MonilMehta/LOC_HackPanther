import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Cases from "./pages/cases/Cases";
import Chat from "./pages/chats/Chats";
import Dash from "./pages/dash/Dash";
import Evidence from "./pages/evidence/Evidence";
import Personal from "./pages/personnel/Personal";
import DutyRoster from "./pages/roster/DutyRoster";
import Alert from "./pages/alert/Alert";
import PublicPortal from "./pages/publicportal/PublicPortal";
import MostWanted from "./pages/wantedlist/MostWanted";
import Bulletin from "./pages/bulletin/Bulletin";
import Analytics from "./pages/analytics/Model";
import Geolocation from "./pages/geolocation/Geolocation";
import AddPolice from "./pages/admin/AddPolice";
import OfficerMetrics from "./pages/admin/Metrics";
import Profile from "./pages/profile/Profile";
import AdminLeaveApplications from "./pages/roster/AdminLeaveApplications";
import CaseAction from "./pages/cases/CaseAction";




const Dashboard = () => {
  return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Routes>
            <Route path="cases/*" element={<Cases />} />
            <Route path="chat" element={<Chat />} />
            <Route path="/" element={<Dash />} />
            <Route path="/dashboard" element={<Dash />} />
            <Route path="evidence" element={<Evidence />} />
            <Route path="personnel" element={<Personal />} />
            <Route path="roster" element={<DutyRoster />} />
            <Route path="alert" element={<Alert />} />
            <Route path="public-portal" element={<PublicPortal/>} />
            <Route path="wanted" element={< MostWanted/>} />
            <Route path="maps" element={<Geolocation />} />
            <Route path="bulletins" element={<Bulletin />} />
            <Route path="profile" element={<Profile />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="add-officer" element={<AddPolice />} />
            <Route path="officer-metrics" element={<OfficerMetrics />} />
            <Route path="admin-roster" element={<AdminLeaveApplications />} />
            <Route path="CaseAction" element={<CaseAction />} />
            <Route path="*" element={<h1>Not Found</h1>} />
          </Routes>
        </div>
      </div>
  );
};

export default Dashboard;
