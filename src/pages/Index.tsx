import React from 'react';
import { useState } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Monitor, Eye, Shield, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DotGrid from "../components/DotGrid";
import BackgroundElements from "../components/BackgroundElements";
import GradientMesh from "../components/GradientMesh";
import ParticleSystem from "../components/ParticleSystem";
import { supabase } from '../supabaseClient';

const Index = () => {
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [testCode, setTestCode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    studentId: '',
    name: '',
    email: '',
    password: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleStudentLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use the entered email directly
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (authError) {
        setError('User does not exist or password is incorrect. Please register or try again.');
        setIsLoading(false);
        return;
      }

      // Success - store info and navigate
      sessionStorage.setItem('studentEmail', loginEmail);
      sessionStorage.setItem('userRole', 'student');
      
      const params = new URLSearchParams();
      params.append('studentEmail', loginEmail);
      if (testCode.trim()) {
        params.append('testCode', testCode.trim());
      }
      navigate(`/exam?${params.toString()}`);

    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminPassword.trim()) {
      setError('Please enter admin password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Authenticate admin with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@proctorcode.com',
        password: adminPassword
      });

      if (authError) {
        // If admin doesn't exist, create admin account (only for demo)
        if (adminPassword === 'admin123') {
          const { error: signUpError } = await supabase.auth.signUp({
            email: 'admin@proctorcode.com',
            password: adminPassword,
            options: {
              data: {
                role: 'admin'
              }
            }
          });

          if (signUpError) {
            setError('Invalid admin credentials');
            return;
          }
        } else {
          setError('Invalid admin password');
          return;
        }
      }

      // Store admin info in session
      sessionStorage.setItem('userRole', 'admin');
      navigate('/admin');

    } catch (err) {
      setError('Admin login failed. Please try again.');
      console.error('Admin login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegisterError('');
    setRegisterSuccess('');
    if (!registerData.studentId.trim() || !registerData.name.trim() || !registerData.email.trim() || !registerData.password.trim()) {
      setRegisterError('Please fill in all fields');
      return;
    }
    setRegisterLoading(true);
    try {
      // Register with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            student_id: registerData.studentId,
            name: registerData.name,
            full_name: registerData.name, // Add this line for Supabase display name
            role: 'student',
          }
        }
      });
      if (signUpError) {
        setRegisterError(signUpError.message || 'Registration failed');
        setRegisterLoading(false);
        return;
      }
      // Insert into students table
      const { error: dbError } = await supabase.from('students').insert([
        {
          student_id: registerData.studentId,
          name: registerData.name,
          email: registerData.email,
        }
      ]);
      if (dbError) {
        setRegisterError('Registered, but failed to save profile info.');
        setRegisterLoading(false);
        return;
      }
      setRegisterSuccess('Registration successful! Please log in.');
      setShowRegister(false);
      setRegisterData({ studentId: '', name: '', email: '', password: '' });
    } catch (err) {
      setRegisterError('Registration failed.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-Layer Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Base gradient mesh - vibrant, but behind everything */}
        <div className="absolute inset-0 scale-105 blur-sm opacity-90 z-0">
          <GradientMesh />
        </div>
        {/* Floating particles - visible, but behind DotGrid */}
        <div className="absolute inset-0 opacity-80 z-0">
          <ParticleSystem />
        </div>
        {/* Floating geometric shapes - visible, but behind DotGrid */}
        <div className="absolute inset-0 opacity-80 z-0">
          <BackgroundElements />
        </div>
        {/* Blur and overlay layers - lower opacity, behind DotGrid */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/10 z-0"></div>
        {/* Interactive dots - always on top of overlays, but below content */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
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
        </div>
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
              <TabsTrigger
                value="student"
                className="text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Student Login
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-xs sm:text-sm">
                Teacher Portal
              </TabsTrigger>
            </TabsList>
            
            <div
              className="relative transition-all duration-500 min-h-[350px] flex flex-col"
              style={{ willChange: 'height' }}
            >
              <TabsContent value="student">
                {/* Student Login Form */}
                {!showRegister ? (
                  <>
                    <Card>
                      <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="text-lg sm:text-xl">Enter Exam</CardTitle>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Please ensure your webcam is working and you're in a quiet environment.
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4">
                        <div>
                          <Label htmlFor="loginEmail" className="text-sm sm:text-base">Email</Label>
                          <Input
                            id="loginEmail"
                            placeholder="Enter your email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="mt-1 h-9 sm:h-10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="loginPassword" className="text-sm sm:text-base">Password</Label>
                          <Input
                            id="loginPassword"
                            type="password"
                            placeholder="Enter your password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleStudentLogin()}
                            className="mt-1 h-9 sm:h-10"
                          />
                        </div>
                       
                        <Button 
                          onClick={handleStudentLogin} 
                          className="w-full bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-sm sm:text-base"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Logging In...' : 'Start Exam'}
                        </Button>
                        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                        <div className="text-xs text-gray-500 space-y-1">
                          
                          <p>• Webcam access will be required</p>
                          <p>• Fullscreen mode will be enforced</p>
                          <p>• Tab switching will be monitored</p>
                        </div>
                        <div className="mt-2 text-center">
                          <Button variant="outline" size="sm" onClick={() => setShowRegister(true)}>
                            Register
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    <div className="space-y-3 sm:space-y-4">
                      <Label htmlFor="registerStudentId" className="text-sm sm:text-base">Student ID</Label>
                      <Input id="registerStudentId" placeholder="Enter your student ID" value={registerData.studentId} onChange={e => setRegisterData(d => ({ ...d, studentId: e.target.value }))} className="mt-1 h-9 sm:h-10" />
                      <Label htmlFor="registerName" className="text-sm sm:text-base">Name</Label>
                      <Input id="registerName" placeholder="Enter your name" value={registerData.name} onChange={e => setRegisterData(d => ({ ...d, name: e.target.value }))} className="mt-1 h-9 sm:h-10" />
                      <Label htmlFor="registerEmail" className="text-sm sm:text-base">College Email</Label>
                      <Input id="registerEmail" placeholder="Enter your college email" value={registerData.email} onChange={e => setRegisterData(d => ({ ...d, email: e.target.value }))} className="mt-1 h-9 sm:h-10" />
                      <Label htmlFor="registerPassword" className="text-sm sm:text-base">Password</Label>
                      <Input id="registerPassword" type="password" placeholder="Enter your password" value={registerData.password} onChange={e => setRegisterData(d => ({ ...d, password: e.target.value }))} className="mt-1 h-9 sm:h-10" />
                      <Button onClick={handleRegister} className="w-full bg-green-600 hover:bg-green-700 h-9 sm:h-10 text-sm sm:text-base" disabled={registerLoading}>
                        {registerLoading ? 'Registering...' : 'Register'}
                      </Button>
                      {registerError && <p className="text-xs text-red-500 mt-2">{registerError}</p>}
                      {registerSuccess && <p className="text-xs text-green-500 mt-2">{registerSuccess}</p>}
                      <div className="mt-2 text-center">
                        <Button variant="outline" size="sm" onClick={() => setShowRegister(false)}>
                          Back to Login
                        </Button>
                      </div>
                    </div>
                  </>
                )}
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
                      disabled={isLoading}
                    >
                      {isLoading ? 'Logging In...' : 'Access Dashboard'}
                    </Button>
                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                    <p className="text-xs text-gray-500">
                      Demo password: admin123
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
