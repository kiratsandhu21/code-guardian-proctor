import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Monitor, 
  Eye, 
  Camera, 
  Shield, 
  AlertTriangle, 
  Users, 
  Send,
  X,
  Plus,
  Settings,
  BookOpen,
  Trash2,
  Play,
  Copy,
  CheckCircle,
  Clock
} from "lucide-react";
import { supabase } from '../supabaseClient'; // adjust path if needed

interface Student {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'flagged';
  alerts: string[];
  timeRemaining: number;
  lastActivity: Date;
}

interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  testCases: { input: string; output: string; }[];
  source?: 'custom' | 'leetcode' | 'geeksforgeeks';
}

interface Test {
  id: string;
  name: string;
  code: string;
  questions: Question[];
  duration: number; // in minutes
  isLive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

interface SecuritySettings {
  eyeTracking: boolean;
  tabSwitchDetection: boolean;
  webcamMonitoring: boolean;
  fullscreenEnforcement: boolean;
  rightClickBlocked: boolean;
  devToolsBlocked: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([
    {
      id: 'STU001',
      name: 'Alice Johnson',
      status: 'active',
      alerts: ['Tab switch detected', 'Looking away from screen'],
      timeRemaining: 2400,
      lastActivity: new Date()
    },
    {
      id: 'STU002', 
      name: 'Bob Smith',
      status: 'active',
      alerts: ['Right-click attempt'],
      timeRemaining: 2100,
      lastActivity: new Date()
    },
    {
      id: 'STU003',
      name: 'Carol Davis',
      status: 'flagged',
      alerts: ['Multiple tab switches', 'Developer tools detected', 'Webcam access revoked'],
      timeRemaining: 1800,
      lastActivity: new Date()
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      studentId: 'STU001',
      studentName: 'Alice Johnson',
      message: 'Student looked away from screen for 5 seconds',
      timestamp: new Date(),
      severity: 'medium'
    },
    {
      id: '2',
      studentId: 'STU003',
      studentName: 'Carol Davis',
      message: 'Developer tools detected',
      timestamp: new Date(Date.now() - 60000),
      severity: 'high'
    },
    {
      id: '3',
      studentId: 'STU002',
      studentName: 'Bob Smith',
      message: 'Right-click attempt blocked',
      timestamp: new Date(Date.now() - 120000),
      severity: 'low'
    }
  ]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [newTest, setNewTest] = useState({
    name: '',
    duration: 60,
    selectedQuestions: [] as string[]
  });
  const [testCode, setTestCode] = useState<string>('');
  const [showTestCode, setShowTestCode] = useState(false);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    eyeTracking: true,
    tabSwitchDetection: true,
    webcamMonitoring: true,
    fullscreenEnforcement: true,
    rightClickBlocked: true,
    devToolsBlocked: true
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    description: '',
    constraints: '',
    testInput: '',
    testOutput: ''
  });

  const [addQuestionError, setAddQuestionError] = useState<string | null>(null);
  const [addQuestionSuccess, setAddQuestionSuccess] = useState<string | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateTestCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TEST-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase.from('questions').select('*');
      if (!error && data) setQuestions(data);
    };
    const fetchTests = async () => {
      const { data, error } = await supabase.from('tests').select('*');
      if (!error && data) setTests(data);
    };
    fetchQuestions();
    fetchTests();
  }, []);

  const createTest = async () => {
    if (!newTest.name || newTest.selectedQuestions.length === 0) {
      alert('Please provide a test name and select at least one question.');
      return;
    }
    const testCode = generateTestCode();
    const { data, error } = await supabase.from('tests').insert([{
      name: newTest.name,
      code: testCode,
      status: 'draft',
      duration: newTest.duration,
      question_ids: newTest.selectedQuestions, // store as array of question IDs
      is_live: false
    }]);
    if (error) {
      alert('Failed to create test.');
      return;
    }
    setNewTest({ name: '', duration: 60, selectedQuestions: [] });
    alert(`Test "${newTest.name}" created with code: ${testCode}`);
    // Re-fetch tests
    const { data: newData } = await supabase.from('tests').select('*');
    if (newData) setTests(newData);
  };

  const goLive = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    const { data, error } = await supabase
      .from('tests')
      .update({ is_live: true, status: 'live' })
      .eq('id', testId);
    if (error) {
      alert('Failed to go live.');
      return;
    }
    setTestCode(test.code);
    setShowTestCode(true);
    // Re-fetch tests
    const { data: newData } = await supabase.from('tests').select('*');
    if (newData) setTests(newData);
  };

  const copyTestCode = () => {
    navigator.clipboard.writeText(testCode);
    alert('Test code copied to clipboard!');
  };

  const sendMessage = () => {
    if (message.trim() && selectedStudent) {
      console.log(`Sending message to ${selectedStudent.id}: ${message}`);
      setMessage('');
      alert(`Message sent to ${selectedStudent.name}`);
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.title || !newQuestion.description) {
      setAddQuestionError('Title and description are required.');
      setTimeout(() => setAddQuestionError(null), 3000);
      return;
    }
    const { data, error } = await supabase.from('questions').insert([{
      title: newQuestion.title,
      difficulty: newQuestion.difficulty,
      description: newQuestion.description,
      constraints: newQuestion.constraints ? newQuestion.constraints.split('\n').filter(c => c.trim()) : [],
      test_cases: newQuestion.testInput && newQuestion.testOutput ? [{ input: newQuestion.testInput, output: newQuestion.testOutput }] : [],
      source: 'custom'
    }]);
    if (error) {
      setAddQuestionError('Failed to add question.');
      setTimeout(() => setAddQuestionError(null), 3000);
      return;
    }
    setAddQuestionSuccess('Question added successfully!');
    setNewQuestion({ title: '', difficulty: 'Easy', description: '', constraints: '', testInput: '', testOutput: '' });
    setTimeout(() => setAddQuestionSuccess(null), 3000);
    // Re-fetch questions
    const { data: newData } = await supabase.from('questions').select('*');
    if (newData) setQuestions(newData);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateSecuritySetting = (key: keyof SecuritySettings, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-green-600 rounded-lg">
                <Monitor className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600">Manage Exams & Monitor Students</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="text-xs sm:text-sm">
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Tabs defaultValue="monitor" className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full max-w-2xl mx-auto">
            <TabsTrigger value="monitor" className="text-xs sm:text-sm">Monitor</TabsTrigger>
            <TabsTrigger value="questions" className="text-xs sm:text-sm">Questions</TabsTrigger>
            <TabsTrigger value="tests" className="text-xs sm:text-sm">Tests</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
            <TabsTrigger value="students" className="text-xs sm:text-sm">Students</TabsTrigger>
          </TabsList>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-4 sm:space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold">
                    {students.filter(s => s.status === 'active').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Flagged Students</CardTitle>
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-red-600">
                    {students.filter(s => s.status === 'flagged').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Alerts</CardTitle>
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                    {alerts.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Live Tests</CardTitle>
                  <Play className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {tests.filter(t => t.isLive).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Students List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Students Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {students.map((student) => (
                        <div 
                          key={student.id}
                          className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedStudent?.id === student.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedStudent(student)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-sm sm:text-base">{student.name}</div>
                                <div className="text-xs sm:text-sm text-gray-500">ID: {student.id}</div>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(student.status)} text-xs sm:text-sm`}>
                              {student.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span>Time: {formatTime(student.timeRemaining)}</span>
                            <span className="text-red-600">
                              {student.alerts.length} alerts
                            </span>
                          </div>
                          
                          {student.alerts.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              Latest: {student.alerts[student.alerts.length - 1]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel */}
              <div className="space-y-4 sm:space-y-6">
                {/* Student Details */}
                {selectedStudent && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Student Communication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <div className="font-semibold text-sm sm:text-base">{selectedStudent.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">ID: {selectedStudent.id}</div>
                        </div>
                        
                        <div>
                          <Label className="text-xs sm:text-sm">Send Message</Label>
                          <div className="flex space-x-2 mt-1">
                            <Textarea
                              placeholder="Type a message to the student..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="flex-1 text-xs sm:text-sm"
                              rows={3}
                            />
                          </div>
                          <Button 
                            onClick={sendMessage}
                            className="w-full mt-2 text-xs sm:text-sm"
                            size="sm"
                          >
                            <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Recent Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48 sm:h-64">
                      <div className="space-y-2 sm:space-y-3">
                        {alerts.map((alert) => (
                          <Alert key={alert.id} className={`${getSeverityColor(alert.severity)} text-xs sm:text-sm`}>
                            <AlertDescription>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-semibold">{alert.studentName}</div>
                                  <div>{alert.message}</div>
                                </div>
                                <div className="text-xs text-gray-500 ml-2">
                                  {alert.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Add Question Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Add New Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {addQuestionError && (
                    <Alert className="bg-red-50 border-red-200 text-red-800 text-xs sm:text-sm">
                      <AlertDescription>{addQuestionError}</AlertDescription>
                    </Alert>
                  )}
                  {addQuestionSuccess && (
                    <Alert className="bg-green-50 border-green-200 text-green-800 text-xs sm:text-sm">
                      <AlertDescription>{addQuestionSuccess}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <Label htmlFor="title" className="text-xs sm:text-sm">Question Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Two Sum"
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 text-xs sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty" className="text-xs sm:text-sm">Difficulty</Label>
                    <Select value={newQuestion.difficulty} onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setNewQuestion(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger className="mt-1 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-xs sm:text-sm">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter the problem description..."
                      value={newQuestion.description}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 text-xs sm:text-sm"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="constraints" className="text-xs sm:text-sm">Constraints (one per line)</Label>
                    <Textarea
                      id="constraints"
                      placeholder="2 ≤ nums.length ≤ 10^4&#10;-10^9 ≤ nums[i] ≤ 10^9"
                      value={newQuestion.constraints}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, constraints: e.target.value }))}
                      className="mt-1 text-xs sm:text-sm"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="testInput" className="text-xs sm:text-sm">Test Input</Label>
                      <Input
                        id="testInput"
                        placeholder="nums = [2,7,11,15], target = 9"
                        value={newQuestion.testInput}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, testInput: e.target.value }))}
                        className="mt-1 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="testOutput" className="text-xs sm:text-sm">Expected Output</Label>
                      <Input
                        id="testOutput"
                        placeholder="[0,1]"
                        value={newQuestion.testOutput}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, testOutput: e.target.value }))}
                        className="mt-1 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={addQuestion}
                    disabled={isAddingQuestion}
                    className="w-full text-xs sm:text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {isAddingQuestion ? 'Adding...' : 'Add Question'}
                  </Button>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Question Bank</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {questions.map((question) => (
                      <div key={question.id} className="p-3 sm:p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base">{question.title}</h3>
                            <Badge className={`mt-1 text-xs ${
                              question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {question.difficulty}
                            </Badge>
                            {question.source && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                {question.source}
                              </Badge>
                            )}
                          </div>
                          <Button
                            onClick={() => deleteQuestion(question.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {question.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Create Test */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Create New Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="testName" className="text-xs sm:text-sm">Test Name</Label>
                    <Input
                      id="testName"
                      placeholder="e.g., Midterm Exam - Arrays"
                      value={newTest.name}
                      onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 text-xs sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration" className="text-xs sm:text-sm">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="60"
                      value={newTest.duration}
                      onChange={(e) => setNewTest(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      className="mt-1 text-xs sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs sm:text-sm">Select Questions</Label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                      {questions.map((question) => (
                        <div key={question.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={question.id}
                            checked={newTest.selectedQuestions.includes(question.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewTest(prev => ({
                                  ...prev,
                                  selectedQuestions: [...prev.selectedQuestions, question.id]
                                }));
                              } else {
                                setNewTest(prev => ({
                                  ...prev,
                                  selectedQuestions: prev.selectedQuestions.filter(id => id !== question.id)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={question.id} className="text-xs sm:text-sm flex-1 cursor-pointer">
                            {question.title} ({question.difficulty})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={createTest}
                    className="w-full text-xs sm:text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Create Test
                  </Button>
                </CardContent>
              </Card>

              {/* Tests List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">All Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {tests.map((test) => (
                      <div key={test.id} className="p-3 sm:p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base">{test.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`text-xs ${
                                test.isLive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {test.isLive ? 'Live' : 'Draft'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {test.questions.length} questions
                              </span>
                              <span className="text-xs text-gray-500">
                                {test.duration} min
                              </span>
                            </div>
                            {test.isLive && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border">
                                <div className="text-xs font-mono text-blue-800">
                                  Code: {test.code}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            {!test.isLive && (
                              <Button
                                onClick={() => goLive(test.id)}
                                size="sm"
                                className="text-xs bg-green-600 hover:bg-green-700"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Go Live
                              </Button>
                            )}
                            {test.isLive && (
                              <Button
                                onClick={() => {
                                  setTestCode(test.code);
                                  setShowTestCode(true);
                                }}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy Code
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-sm sm:text-base">Eye Tracking</div>
                        <div className="text-xs sm:text-sm text-gray-600">Monitor student gaze</div>
                      </div>
                      <Switch
                        checked={securitySettings.eyeTracking}
                        onCheckedChange={(checked) => updateSecuritySetting('eyeTracking', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-sm sm:text-base">Tab Switch Detection</div>
                        <div className="text-xs sm:text-sm text-gray-600">Detect tab switching</div>
                      </div>
                      <Switch
                        checked={securitySettings.tabSwitchDetection}
                        onCheckedChange={(checked) => updateSecuritySetting('tabSwitchDetection', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-sm sm:text-base">Webcam Monitoring</div>
                        <div className="text-xs sm:text-sm text-gray-600">Enable webcam tracking</div>
                      </div>
                      <Switch
                        checked={securitySettings.webcamMonitoring}
                        onCheckedChange={(checked) => updateSecuritySetting('webcamMonitoring', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-sm sm:text-base">Fullscreen Enforcement</div>
                        <div className="text-xs sm:text-sm text-gray-600">Force fullscreen mode</div>
                      </div>
                      <Switch
                        checked={securitySettings.fullscreenEnforcement}
                        onCheckedChange={(checked) => updateSecuritySetting('fullscreenEnforcement', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-sm sm:text-base">Block Right-Click</div>
                        <div className="text-xs sm:text-sm text-gray-600">Disable context menu</div>
                      </div>
                      <Switch
                        checked={securitySettings.rightClickBlocked}
                        onCheckedChange={(checked) => updateSecuritySetting('rightClickBlocked', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-sm sm:text-base">Block Dev Tools</div>
                        <div className="text-xs sm:text-sm text-gray-600">Prevent developer tools</div>
                      </div>
                      <Switch
                        checked={securitySettings.devToolsBlocked}
                        onCheckedChange={(checked) => updateSecuritySetting('devToolsBlocked', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">All Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm sm:text-base">{student.name}</div>
                            <div className="text-xs sm:text-sm text-gray-500">ID: {student.id}</div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(student.status)} text-xs sm:text-sm`}>
                          {student.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-gray-500">Time Remaining:</span>
                          <div className="font-mono">{formatTime(student.timeRemaining)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Alerts:</span>
                          <div className="text-red-600">{student.alerts.length}</div>
                        </div>
                      </div>
                      
                      {student.alerts.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">Recent Alerts:</div>
                          <div className="space-y-1">
                            {student.alerts.slice(-2).map((alert, index) => (
                              <div key={index} className="text-xs bg-red-50 text-red-700 p-1 rounded">
                                {alert}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Test Code Modal */}
      {showTestCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Test is Live!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs sm:text-sm">Share this code with students:</Label>
                <div className="mt-2 p-3 bg-gray-100 rounded border">
                  <div className="text-lg font-mono text-center font-bold">
                    {testCode}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={copyTestCode}
                  className="flex-1 text-xs sm:text-sm"
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Copy Code
                </Button>
                <Button
                  onClick={() => setShowTestCode(false)}
                  variant="outline"
                  className="text-xs sm:text-sm"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
