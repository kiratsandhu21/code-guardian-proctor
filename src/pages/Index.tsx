import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Eye, Shield, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DotGrid from "@/components/DotGrid";
import BackgroundElements from "@/components/BackgroundElements";
import GradientMesh from "@/components/GradientMesh";
import ParticleSystem from "@/components/ParticleSystem";

const Index = () => {
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [testCode, setTestCode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate();

  const handleStudentLogin = () => {
    if (studentId.trim() && studentPassword.trim()) {
      // Simple password validation for demo
      if (studentPassword === 'student123') {
        // If test code is provided, include it in the URL
        const params = new URLSearchParams();
        params.append('studentId', studentId);
        if (testCode.trim()) {
          params.append('testCode', testCode.trim());
        }
        navigate(`/exam?${params.toString()}`);
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-Layer Background */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient mesh */}
        <GradientMesh />
        
        {/* Floating particles */}
        <ParticleSystem />
        
        {/* Interactive dots */}
        <DotGrid 
          dotSize={4}
          gap={20}
          baseColor="#000000"
          activeColor="#333333"
          proximity={60}
          speedTrigger={60}
          shockRadius={120}
          shockStrength={2}
          maxSpeed={2500}
          resistance={600}
          returnDuration={1.0}
        />
        
        {/* Floating geometric shapes */}
        <BackgroundElements />
        
        {/* Blur and overlay layers */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/10"></div>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen bg-white/60">
        {/* Header */}
        <div className="bg-white/95 border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
                <Monitor className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">ProctorCode</h1>
                <p className="text-xs sm:text-sm text-gray-600">AI-Powered Online Coding Exams</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl px-6 py-4 shadow-lg">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
              Secure Online Coding Assessments
            </h2>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <Eye className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 mx-auto mb-2 sm:mb-3 lg:mb-4" />
              <CardTitle className="text-sm sm:text-base lg:text-lg">AI Eye Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                Advanced gaze detection using TensorFlow.js to monitor attention and prevent cheating.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-600 mx-auto mb-2 sm:mb-3 lg:mb-4" />
              <CardTitle className="text-sm sm:text-base lg:text-lg">Security Measures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                Comprehensive anti-cheating with tab monitoring, fullscreen enforcement, and input restrictions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3 sm:pb-4">
              <Camera className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-600 mx-auto mb-2 sm:mb-3 lg:mb-4" />
              <CardTitle className="text-sm sm:text-base lg:text-lg">Live Proctoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                Real-time admin dashboard with live feeds, alerts, and communication tools.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Login Section */}
        <div className="max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
              <TabsTrigger value="student" className="text-xs sm:text-sm">Student Login</TabsTrigger>
              <TabsTrigger value="admin" className="text-xs sm:text-sm">Teacher Portal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Enter Exam</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Please ensure your webcam is working and you're in a quiet environment.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="studentId" className="text-sm sm:text-base">Student ID</Label>
                    <Input
                      id="studentId"
                      placeholder="Enter your student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="mt-1 h-9 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="studentPassword" className="text-sm sm:text-base">Password</Label>
                    <Input
                      id="studentPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleStudentLogin()}
                      className="mt-1 h-9 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="testCode" className="text-sm sm:text-base">Test Code (Optional)</Label>
                    <Input
                      id="testCode"
                      placeholder="e.g., TEST-ABC123"
                      value={testCode}
                      onChange={(e) => setTestCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleStudentLogin()}
                      className="mt-1 h-9 sm:h-10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the test code provided by your teacher to access a specific exam.
                    </p>
                  </div>
                  <Button 
                    onClick={handleStudentLogin} 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-sm sm:text-base"
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
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Teacher Access</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Access the dashboard to create questions and monitor students.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="adminPassword" className="text-sm sm:text-base">Teacher Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Enter teacher password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                      className="mt-1 h-9 sm:h-10"
                    />
                  </div>
                  <Button 
                    onClick={handleAdminLogin}
                    className="w-full bg-green-600 hover:bg-green-700 h-9 sm:h-10 text-sm sm:text-base"
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
    </div>
  );
};

export default Index;
