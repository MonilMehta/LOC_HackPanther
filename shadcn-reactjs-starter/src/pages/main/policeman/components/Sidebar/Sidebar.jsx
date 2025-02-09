import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  ClipboardList,
  Users,
  Bell,
  Map,
  BarChart3,
  Shield,
  Calendar,
  FileImage,
  Settings,
  LogOut,
  AlertTriangle,
  BadgeAlert,
  UserCircle,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["role"]);
  const role = cookies.role;

  // Updated menuItems with role-based access
  const menuItems = [
    // Citizen-only accessible items (also accessible by officers and admin)
    {
      title: "Public Portal",
      icon: <Shield className="h-5 w-5" />,
      path: "/main/public-portal",
      roles: ["citizen", "officer", "admin"],
    },
    {
      title: "Wanted List",
      icon: <BadgeAlert className="h-5 w-5" />,
      path: "/main/wanted",
      roles: ["citizen", "officer", "admin"],
    },

    // Officer and admin accessible items
    ...(role !== "citizen"
      ? [
          {
            title: "Dashboard",
            icon: <LayoutDashboard className="h-5 w-5" />,
            path: "/main/",
            roles: ["officer", "admin"],
          },
          {
            title: "Case Management",
            icon: <ClipboardList className="h-5 w-5" />,
            path: "/main/cases",
            roles: ["officer", "admin"],
          },
          {
            title: "Evidence Center",
            icon: <FileImage className="h-5 w-5" />,
            path: "/main/evidence",
            roles: ["officer", "admin"],
          },
          {
            title: "Personnel Management",
            icon: <Users className="h-5 w-5" />,
            path: "/main/personnel",
            roles: ["officer", "admin"],
          },
          {
            title: "Communication Hub",
            icon: <MessageSquare className="h-5 w-5" />,
            path: "/main/chat",
            roles: ["officer", "admin"],
          },
          {
            title: "Emergency Alerts",
            icon: <Bell className="h-5 w-5" />,
            path: "/main/alert",
            roles: ["officer", "admin"],
          },
          {
            title: "GeoLocation",
            icon: <Map className="h-5 w-5" />,
            path: "/main/maps",
            roles: ["officer", "admin"],
          },
          {
            title: "Crime Analytics",
            icon: <BarChart3 className="h-5 w-5" />,
            path: "/main/analytics",
            roles: ["officer", "admin"],
          },
          {
            title: "Safety Bulletins",
            icon: <AlertTriangle className="h-5 w-5" />,
            path: "/main/bulletins",
            roles: ["officer", "admin"],
          },
        ]
      : []),

    // Admin-specific items
    ...(role === "admin"
      ? [
          {
            title: "Add Officer",
            icon: <Users className="h-5 w-5" />,
            path: "/main/add-officer",
            roles: ["admin"],
          },
          {
            title: "Officer Metrics",
            icon: <BarChart3 className="h-5 w-5" />,
            path: "/main/officer-metrics",
            roles: ["admin"],
          },
          {
            title: "Admin Roster",
            icon: <Calendar className="h-5 w-5" />,
            path: "/main/admin-roster",
            roles: ["admin"],
          },
        ]
      : []),

    // Officer-specific items
    ...(role === "officer"
      ? [
          {
            title: "Duty Roster",
            icon: <Calendar className="h-5 w-5" />,
            path: "/main/roster",
            roles: ["officer"],
          },
        ]
      : []),
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleCheckIn = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/attendance/enterAttendance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            /* include any required attendance data */
          }),
        }
      );
      if (!res.ok) throw new Error("Check-in failed");
      fetchAttendance();
    } catch (error) {
      console.error("Error during check-in:", error);
    }
  };

  const handleLogout = () => {
    // Clear cookies
    removeCookie("role");
    removeCookie("id");
    // Redirect to login page
    navigate("/");
  };

  // Update SidebarContent to only show Check In button for officers and admin
  const SidebarContent = () => (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 display flex items-center gap-4">
      <Shield className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-primary">SurakshaSeva</h2>
      </div>
      

      {role !== "citizen" && (
        <div className="flex justify-center mb-4">
          <Button onClick={handleCheckIn}>Attendance</Button>
        </div>
      )}

      <ScrollArea className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-2 py-4">
          {menuItems
            .filter((item) => item.roles.includes(role))
            .map((item) => (
              <Button
                key={item.path}
                variant={isActiveRoute(item.path) ? "default" : "ghost"}
                className={`w-full justify-start gap-2 ${
                  isActiveRoute(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary/10"
                }`}
                asChild
              >
                <Link to={item.path}>
                  {item.icon}
                  <span className="text-sm">{item.title}</span>
                </Link>
              </Button>
            ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 pb-4">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <UserCircle className="h-5 w-5" />
            My Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-500 hover:text-red-500 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen w-64 border-r bg-background/80 backdrop-blur-sm overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Add a spacer div to prevent content overlap */}
      <div className="hidden lg:block w-64"></div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 fixed inset-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;