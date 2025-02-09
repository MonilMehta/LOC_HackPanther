import React, { useEffect, useState } from "react";
import {
  MapPin,
  Badge,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  AlertCircle,
  Loader2,
  Search,
  RefreshCw,
  UserCheck,
  Clock,
  FileText,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCookies } from "react-cookie";
import { getUsers } from "../../../../../apis/user.api";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Personal = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRank, setFilterRank] = useState("all");
  const [filterStation, setFilterStation] = useState("all");
  const [cookies] = useCookies(["accessToken"]);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(getUsers, {
        headers: { Authorization: `Bearer ${cookies.accessToken}` },
      });
      console.log(response?.data?.data);
      setOfficers(response?.data?.data);
      if (!response) throw new Error("Failed to fetch officer data");
    } catch (error) {
      console.error("Failed to fetch officers:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleFilterChange = (type, value) => {
    if (type === "rank") {
      setFilterRank(value);
    } else if (type === "station") {
      setFilterStation(value);
    }
  };

  const filteredOfficers = officers.filter((officer) => {
    const searchFields = [
      officer.fullname,
      officer.username,
      officer.policeDetails?.badgeNumber,
    ]
      .filter(Boolean)
      .map((field) => field.toLowerCase());

    const matchesSearch =
      searchTerm === "" ||
      searchFields.some((field) => field.includes(searchTerm.toLowerCase()));

    const matchesRank =
      filterRank === "all" || officer.policeDetails?.rank === filterRank;

    const matchesStation =
      filterStation === "all" ||
      officer.policeDetails?.station === filterStation;

    return matchesSearch && matchesRank && matchesStation;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black-50 to-gray-50">
        <Loader2 className="h-8 w-8 text-black-600 animate-spin mb-4" />
        <div className="text-xl text-gray-600">Loading officer profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black-50 to-gray-50 p-6">
        <Alert variant="destructive" className="max-w-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please try refreshing the page or contact support if the
            problem persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { icon: UserCheck, label: "Total Officers", value: officers.length },
        {
          icon: Briefcase,
          label: "Active Cases",
          value: officers.reduce(
            (acc, officer) => acc + officer.policeDetails.assignedCases.length,
            0
          ),
        },
        {
          icon: Clock,
          label: "On Duty",
          value: Math.floor(officers.length * 0.8),
        },
        {
          icon: FileText,
          label: "Reports Filed",
          value: officers.reduce(
            (acc, officer) =>
              acc +
              officer.policeDetails.assignedCases.filter(
                (c) => c.status === "Closed"
              ).length,
            0
          ),
        },
      ].map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className="flex-shrink-0">
              <stat.icon className="h-8 w-8 text-black-600" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderFilters = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex-1 min-w-0 md:w-2/3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name, username, or badge number..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters{" "}
              {filterRank !== "all" || filterStation !== "all"
                ? "(Active)"
                : ""}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-4">
            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rank</label>
                <Select
                  value={filterRank}
                  onValueChange={(value) => handleFilterChange("rank", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranks</SelectItem>
                    {Array.from(
                      new Set(officers.map((o) => o.policeDetails.rank))
                    )
                      .filter(Boolean)
                      .map((rank) => (
                        <SelectItem key={rank} value={rank}>
                          {rank}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Station</label>
                <Select
                  value={filterStation}
                  onValueChange={(value) =>
                    handleFilterChange("station", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {Array.from(
                      new Set(officers.map((o) => o.policeDetails.station))
                    )
                      .filter(Boolean)
                      .map((station) => (
                        <SelectItem key={station} value={station}>
                          {station}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("");
            setFilterRank("all");
            setFilterStation("all");
          }}
          className="gap-2"
          disabled={
            searchTerm === "" && filterRank === "all" && filterStation === "all"
          }
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Police Officer Profiles
          </h1>
          <p className="text-gray-600">
            Managing {officers.length} Active Officers
          </p>
        </header>
        {renderStats()} {/* Just call renderStats directly */}
        <div className="my-8">
          {" "}
          {/* Add margin to separate stats from filters */}
          {renderFilters()}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {filteredOfficers.map((officer) => (
            <Card
              key={officer._id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200"
            >
              <CardHeader className="bg-black-600 text-black p-4 md:p-6">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h2 className="text-xl md:text-2xl font-bold truncate">
                      {officer.fullname}
                    </h2>
                    <p className="text-black-100 mt-1 truncate">
                      {officer.username}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-black-700 rounded-full text-sm font-medium shadow-sm whitespace-nowrap">
                    {officer.policeDetails.rank}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 group hover:bg-gray-50 p-2 rounded-lg transition-colors overflow-hidden">
                      <Badge className="flex-shrink-0 w-5 h-5 text-black-600" />
                      <span className="text-gray-700 truncate">
                        Badge: {officer.policeDetails.badgeNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 group hover:bg-gray-50 p-2 rounded-lg transition-colors overflow-hidden">
                      <MapPin className="flex-shrink-0 w-5 h-5 text-black-600" />
                      <span className="text-gray-700 truncate">
                        {officer.policeDetails.station}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 group hover:bg-gray-50 p-2 rounded-lg transition-colors overflow-hidden">
                      <Phone className="flex-shrink-0 w-5 h-5 text-black-600" />
                      <span className="text-gray-700 truncate">
                        {officer.phone_no}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 group hover:bg-gray-50 p-2 rounded-lg transition-colors overflow-hidden">
                      <Mail className="flex-shrink-0 w-5 h-5 text-black-600" />
                      <span className="text-gray-700 truncate">
                        {officer.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 group hover:bg-gray-50 p-2 rounded-lg transition-colors overflow-hidden">
                      <Calendar className="flex-shrink-0 w-5 h-5 text-black-600" />
                      <span className="text-gray-700 truncate">
                        DOB: {formatDate(officer.date_of_birth)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-black-600" />
                      <span className="font-medium text-gray-900">Address</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <p className="text-gray-700">
                        {officer.address.street}
                        <br />
                        {officer.address.city}, {officer.address.state}
                        <br />
                        {officer.address.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-black-600" />
                      <span className="font-medium text-gray-900">
                        Assigned Cases
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {officer.policeDetails.assignedCases.length} total
                    </span>
                  </div>
                  <div className="space-y-4">
                    {officer.policeDetails.assignedCases.map((caseDetail) => (
                      <div
                        key={caseDetail._id}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">
                            Case #{caseDetail.caseNo}: {caseDetail.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-medium shadow-sm ${
                              caseDetail.status === "Open"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {caseDetail.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {caseDetail.description}
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {caseDetail.location.street},{" "}
                            {caseDetail.location.city}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Personal;
