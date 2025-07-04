
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Eye, Shield, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate();

  const handleStudentLogin = () => {
    if (studentId.trim() && studentPassword.trim()) {
      // Simple password validation for demo
      if (studentPassword === 'student123') {
        navigate(`/exam?studentId=${encodeURIComponent(studentId)}`);
      } else {
        alert('Invalid student credentials');
      }
    }
  };

  const handleAdminLogin = () => {
    // Simple password check for demo
    if (adminPassword === 'admin123') {
      navigate('/admin');
    } else {
      alert('Invalid admin password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ProctorCode</h1>
              <p className="text-sm text-gray-600">AI-Powered Online Coding Exams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Secure Online Coding Assessments
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience next-generation proctored coding exams with AI-powered monitoring, 
            real-time security, and professional assessment tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>AI Eye Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Advanced gaze detection using TensorFlow.js to monitor attention and prevent cheating.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Security Measures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comprehensive anti-cheating with tab monitoring, fullscreen enforcement, and input restrictions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Camera className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Live Proctoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Real-time admin dashboard with live feeds, alerts, and communication tools.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Login Section */}
        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student Login</TabsTrigger>
              <TabsTrigger value="admin">Teacher Portal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <Card>
                <CardHeader>
                  <CardTitle>Enter Exam</CardTitle>
                  <p className="text-sm text-gray-600">
                    Please ensure your webcam is working and you're in a quiet environment.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      placeholder="Enter your student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentPassword">Password</Label>
                    <Input
                      id="studentPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleStudentLogin()}
                    />
                  </div>
                  <Button 
                    onClick={handleStudentLogin} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!studentId.trim() || !studentPassword.trim()}
                  >
                    Start Exam
                  </Button>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Demo password: student123</p>
                    <p>• Webcam access will be required</p>
                    <p>• Fullscreen mode will be enforced</p>
                    <p>• Tab switching will be monitored</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Teacher Access</CardTitle>
                  <p className="text-sm text-gray-600">
                    Access the dashboard to create questions and monitor students.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="adminPassword">Teacher Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter teacher password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    />
                  </div>
                  <Button 
                    onClick={handleAdminLogin}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Access Dashboard
                  </Button>
                  <p className="text-xs text-gray-500">
                    Demo password: admin123
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
