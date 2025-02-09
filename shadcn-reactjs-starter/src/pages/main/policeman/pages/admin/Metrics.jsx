import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Award, FileText, Users, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';

const PerformanceMetrics = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const roleCookie = cookies.find(cookie => cookie.trim().startsWith('role='));
    if (roleCookie && roleCookie.split('=')[1] === 'admin') {
      setIsAdmin(true);
    }
  }, []);

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You need administrator privileges to view this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Sample data
  const monthlyPerformance = [
    { month: 'Jan', casesResolved: 45, responseTime: 25, arrests: 12, complaints: 2 },
    { month: 'Feb', casesResolved: 52, responseTime: 22, arrests: 15, complaints: 1 },
    { month: 'Mar', casesResolved: 48, responseTime: 24, arrests: 10, complaints: 3 },
    { month: 'Apr', casesResolved: 60, responseTime: 20, arrests: 18, complaints: 2 }
  ];

  const officerPerformance = [
    { id: 1, name: "John Smith", rank: "Sergeant", metrics: { 
      casesResolved: 15, responseTime: 22, arrests: 5, rating: 95 
    }},
    { id: 2, name: "Sarah Johnson", rank: "Officer", metrics: { 
      casesResolved: 12, responseTime: 25, arrests: 3, rating: 88 
    }},
    { id: 3, name: "Mike Wilson", rank: "Officer", metrics: { 
      casesResolved: 18, responseTime: 20, arrests: 6, rating: 92 
    }}
  ];

  const getRatingColor = (rating) => {
    if (rating >= 90) return "bg-green-100 text-green-800";
    if (rating >= 80) return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="text-gray-600">Comprehensive view of officer performance metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: CheckCircle, label: 'Cases Resolved', value: '165', trend: '+12%' },
          { icon: Clock, label: 'Avg Response Time', value: '23min', trend: '-8%' },
          { icon: AlertTriangle, label: 'Complaints', value: '8', trend: '-2%' },
          { icon: Award, label: 'Avg Rating', value: '91%', trend: '+5%' }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center p-6">
              <div className="flex-1">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <span className={`text-sm ${
                  stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend}
                </span>
              </div>
              <stat.icon className="h-8 w-8 text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Trends</CardTitle>
            <CardDescription>Case resolution and response times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="casesResolved" 
                    stroke="#3b82f6" 
                    name="Cases Resolved"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#10b981" 
                    name="Avg Response Time (min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Officer Performance Ratings</CardTitle>
            <CardDescription>Individual officer metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {officerPerformance.sort((a, b) => b.metrics.rating - a.metrics.rating)
                .map((officer) => (
                <div key={officer.id} 
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{officer.name}</h3>
                      <p className="text-sm text-gray-500">{officer.rank}</p>
                    </div>
                    <Badge className={getRatingColor(officer.metrics.rating)}>
                      {officer.metrics.rating}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Cases</p>
                      <p className="font-medium">{officer.metrics.casesResolved}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Response Time</p>
                      <p className="font-medium">{officer.metrics.responseTime}min</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Arrests</p>
                      <p className="font-medium">{officer.metrics.arrests}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PerformanceMetrics;