import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  FileText,
  AlertTriangle,
  Map,
  Shield,
  BadgeAlert,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { useCookies } from "react-cookie";
import { getUsers } from "../../../../../apis/user.api";
import mostWantedData from '../../../../../assets/most_wanted.json';

const StatCard = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  link,
}) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center text-sm text-muted-foreground">
        {trend === "up" ? (
          <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
        ) : trend === "down" ? (
          <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
        ) : null}
        {trendValue}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      {link && (
        <Link
          to={link}
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/5 flex items-center justify-center"
        >
          <Button variant="ghost" size="sm" className="gap-2">
            View Details <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </CardContent>
  </Card>
);

const Dash = () => {
  const [allCases, setAllCases] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [bulletins, setBulletins] = useState([]); // new state for bulletins
  const currentTime = new Date().toLocaleTimeString();
  const [cookies] = useCookies(["name", "accessToken"]);
  const navigate = useNavigate();
  useEffect(() => {
    fetch("http://localhost:8000/api/case/getCase")
      .then((res) => res.json())
      .then((response) => {
        console.log(response.data)
        setAllCases(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      })
      .catch((err) => console.error("Error fetching cases:", err));
    const alertsGet = async () => {
      const response = await axios.get(
        "http://localhost:8000/api/alert/getAlert"
      );
      setAlerts(response?.data?.alert || []);
    };
    const OfficerGet = async () => {
      const response = await axios.get(getUsers, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      setOfficers(response?.data?.data)
    };
    // New: Fetch bulletins from the backend
    const fetchBulletins = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/bulletin/getBulletin");
        setBulletins(response.data.bulletin || []);
      } catch (err) {
        console.error("Error fetching bulletins:", err);
      }
    };

    alertsGet();
    OfficerGet();
    fetchBulletins();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">Welcome back, {cookies.name}</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          {currentTime}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Cases"
          value={allCases.length}
          description="Open investigations requiring attention"
          icon={<Activity className="h-4 w-4 text-blue-500" />}
          trend="up"
          trendValue="+12% from last month"
          link="/main/cases"
        />
        <StatCard
          title="Emergency Alerts"
          value={alerts.length}
          description="Pending emergency situations"
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          trend="up"
          trendValue="4 new alerts"
          link="/main/alert"
        />
        <StatCard
          title="Officers on Duty"
          value={officers.length}
          description="Currently active personnel"
          icon={<Users className="h-4 w-4 text-green-500" />}
          trend="down"
          trendValue="-3 from last shift"
          link="/main/personnel"
        />
        <StatCard
          title="Wanted Persons"
          value={mostWantedData.data.length}
          description="High-priority suspects"
          icon={<BadgeAlert className="h-4 w-4 text-yellow-500" />}
          trend="up"
          trendValue="+2 new additions"
          link="/main/wanted"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>Last 24 hours case updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allCases && allCases.map((case_) => (
              <div
                key={case_._id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground min-w-[100px]">
                    {Math.floor((Date.now() - new Date(case_.createdAt)) / (1000 * 60 * 60))} hours ago
                  </div>
                  <div>{case_.type}</div>
                  <div className="text-muted-foreground">{case_.location.street}</div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs ${
                    case_.status === "Solved"
                      ? "bg-green-100 text-green-800"
                      : case_.status === "Active"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {case_.status}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/report')}>
              <FileText className="h-4 w-4" />
              File New Report
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/main/maps')}>
              <Map className="h-4 w-4" />
              View Patrol Map
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Shield className="h-4 w-4" />
              Emergency Response
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/main/alert')}>
              <AlertTriangle className="h-4 w-4" />
              Issue Alert
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Patrol Areas</CardTitle>
            <CardDescription>Current deployment zones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] rounded-md bg-slate-100 flex items-center justify-center">
              <Map className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Response Time</CardTitle>
            <CardDescription>Average response metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <div>Urban Areas</div>
                  <div className="font-medium">8.2 minutes</div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full w-[85%] rounded-full bg-green-500" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <div>Suburban Areas</div>
                  <div className="font-medium">12.5 minutes</div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full w-[70%] rounded-full bg-yellow-500" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <div>Rural Areas</div>
                  <div className="font-medium">18.3 minutes</div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full w-[55%] rounded-full bg-red-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bulletins</CardTitle>
            <CardDescription>Latest safety updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bulletins.length === 0 ? (
                <div className="text-center text-muted-foreground">No bulletins found</div>
              ) : (
                bulletins.map((bulletin) => (
                  <div key={bulletin._id} className="flex items-start gap-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        bulletin.type?.toLowerCase() === "alert"
                          ? "bg-red-100 text-red-800"
                          : bulletin.type?.toLowerCase() === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {bulletin.type}
                    </span>
                    <span>{bulletin.title}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dash;