import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Phone, Mail, Award, Calendar, Clock, Activity, Shield, Users, Star, Briefcase, ChevronRight, FileText, Bell, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Profile = () => {
  const officerData = {
    name: "Inspector Rajesh Kumar",
    badge: "IPS-2847",
    rank: "Senior Inspector",
    station: "Central Police Station, Mumbai",
    contact: {
      phone: "+91 98765 43210",
      email: "rajesh.kumar@police.gov.in"
    },
    stats: {
      casesHandled: 245,
      solvedRate: "87%",
      commendations: 12,
      yearsOfService: 15
    },
    currentCases: [
      { id: 1, caseNumber: "MUM-2024-0234", status: "Active", priority: "High", type: "Cyber Crime", lastUpdated: "2 hours ago" },
      { id: 2, caseNumber: "MUM-2024-0189", status: "Under Investigation", priority: "Medium", type: "Financial Fraud", lastUpdated: "1 day ago" },
      { id: 3, caseNumber: "MUM-2024-0156", status: "Pending Review", priority: "Low", type: "Public Safety", lastUpdated: "3 days ago" }
    ],
    recentActivity: [
      { id: 1, action: "Case Update", description: "Added new evidence to case MUM-2024-0234", timestamp: "2 hours ago" },
      { id: 2, action: "Report Filed", description: "Submitted investigation report for case MUM-2024-0189", timestamp: "1 day ago" },
      { id: 3, action: "Commendation", description: "Received appreciation for solving cyber fraud case", timestamp: "1 week ago" }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gradient-to-b from-blue-50 via-white to-gray-50 min-h-screen">
      {/* Alert Banner */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          Welcome to the new officer dashboard. Check out the enhanced features and improved case management system.
        </AlertDescription>
      </Alert>

      {/* Hero Section with Profile */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl opacity-10 blur-xl" />
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Picture */}
              <Avatar className="h-36 w-36 border-4 border-white shadow-xl">
                <AvatarFallback className="text-4xl bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                  {officerData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{officerData.name}</h1>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Badge variant="secondary" className="px-6 py-2 text-lg rounded-full">
                      {officerData.badge}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-6 py-2 text-lg rounded-full">
                      {officerData.rank}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 text-gray-600">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Button variant="outline" className="gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      {officerData.station}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <Button variant="outline" className="gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      {officerData.contact.phone}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      {officerData.contact.email}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Briefcase, label: "Cases Handled", value: officerData.stats.casesHandled },
          { icon: Star, label: "Solved Rate", value: officerData.stats.solvedRate },
          { icon: Calendar, label: "Years of Service", value: officerData.stats.yearsOfService },
          { icon: Award, label: "Commendations", value: officerData.stats.commendations }
        ].map((stat, index) => (
          <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="cases" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6">
          <TabsTrigger value="cases">Active Cases</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="cases">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                Active Cases
              </CardTitle>
              <CardDescription>Manage and track your current case assignments</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid gap-4">
                  {officerData.currentCases.map((caseItem) => (
                    <Dialog key={caseItem.id}>
                      <DialogTrigger asChild>
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-xl text-gray-900">{caseItem.caseNumber}</span>
                                <Badge 
                                  variant={
                                    caseItem.priority === "High" ? "destructive" : 
                                    caseItem.priority === "Medium" ? "secondary" : 
                                    "outline"
                                  }
                                  className="rounded-full px-4"
                                >
                                  {caseItem.priority}
                                </Badge>
                              </div>
                              <p className="text-gray-700 font-medium">{caseItem.type}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                <span>Last updated {caseItem.lastUpdated}</span>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`
                                px-6 py-2 rounded-full font-medium
                                ${caseItem.status === "Active" ? "bg-green-50 text-green-700 border-green-200" : 
                                  caseItem.status === "Under Investigation" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                  "bg-gray-50 text-gray-700 border-gray-200"}
                              `}
                            >
                              {caseItem.status}
                            </Badge>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Case Details - {caseItem.caseNumber}</DialogTitle>
                          <DialogDescription>
                            Comprehensive information about the case and its current status.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Status</label>
                              <p className="text-gray-900">{caseItem.status}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Priority</label>
                              <p className="text-gray-900">{caseItem.priority}</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Type</label>
                            <p className="text-gray-900">{caseItem.type}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Last Updated</label>
                            <p className="text-gray-900">{caseItem.lastUpdated}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-6">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Activity className="h-6 w-6 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Track your recent actions and updates</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {officerData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="rounded-full p-2 bg-blue-100">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-gray-600">{activity.description}</p>
                        <p className="text-sm text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;