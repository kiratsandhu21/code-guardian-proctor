
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
  Trash2
} from "lucide-react";

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

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      title: 'Two Sum',
      difficulty: 'Easy',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      constraints: ['2 ≤ nums.length ≤ 10^4', '-10^9 ≤ nums[i] ≤ 10^9'],
      testCases: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }]
    }
  ]);

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

  const sendMessage = () => {
    if (message.trim() && selectedStudent) {
      console.log(`Sending message to ${selectedStudent.id}: ${message}`);
      setMessage('');
      alert(`Message sent to ${selectedStudent.name}`);
    }
  };

  const addQuestion = () => {
    if (newQuestion.title && newQuestion.description) {
      const question: Question = {
        id: Date.now().toString(),
        title: newQuestion.title,
        difficulty: newQuestion.difficulty,
        description: newQuestion.description,
        constraints: newQuestion.constraints.split('\n').filter(c => c.trim()),
        testCases: [{
          input: newQuestion.testInput,
          output: newQuestion.testOutput
        }]
      };
      setQuestions([...questions, question]);
      setNewQuestion({
        title: '',
        difficulty: 'Easy',
        description: '',
        constraints: '',
        testInput: '',
        testOutput: ''
      });
    }
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateSecuritySetting = (key: keyof SecuritySettings, value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-600">Manage Exams & Monitor Students</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="monitor" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {students.filter(s => s.status === 'active').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flagged Students</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {students.filter(s => s.status === 'flagged').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                  <Eye className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {alerts.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Questions</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {questions.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Students List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Students Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {students.map((student) => (
                        <div 
                          key={student.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedStudent?.id === student.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedStudent(student)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <Camera className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-semibold">{student.name}</div>
                                <div className="text-sm text-gray-500">ID: {student.id}</div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(student.status)}>
                              {student.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
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
              <div className="space-y-6">
                {/* Student Details */}
                {selectedStudent && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Communication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="font-semibold">{selectedStudent.name}</div>
                          <div className="text-sm text-gray-500">ID: {selectedStudent.id}</div>
                        </div>
                        
                        <div>
                          <Label>Send Message</Label>
                          <div className="flex space-x-2 mt-1">
                            <Textarea
                              placeholder="Type a message to the student..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="flex-1"
                              rows={3}
                            />
                          </div>
                          <Button 
                            onClick={sendMessage}
                            className="w-full mt-2"
                            size="sm"
                          >
                            <Send className="h-4 w-4 mr-2" />
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
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Recent Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {alerts.map((alert) => (
                          <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                            <AlertDescription>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{alert.studentName}</div>
                                  <div className="text-xs text-gray-500">ID: {alert.studentId}</div>
                                  <div className="text-sm">{alert.message}</div>
                                </div>
                                <div className="text-xs text-gray-500">
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
          <TabsContent value="questions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Question */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Add New Question</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                      placeholder="e.g., Two Sum"
                    />
                  </div>
                  
                  <div>
                    <Label>Difficulty</Label>
                    <Select 
                      value={newQuestion.difficulty} 
                      onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => 
                        setNewQuestion({...newQuestion, difficulty: value})
                      }
                    >
                      <SelectTrigger>
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
                    <Label>Description</Label>
                    <Textarea
                      value={newQuestion.description}
                      onChange={(e) => setNewQuestion({...newQuestion, description: e.target.value})}
                      placeholder="Problem description..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Constraints (one per line)</Label>
                    <Textarea
                      value={newQuestion.constraints}
                      onChange={(e) => setNewQuestion({...newQuestion, constraints: e.target.value})}
                      placeholder="2 ≤ nums.length ≤ 10^4"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Test Input</Label>
                      <Input
                        value={newQuestion.testInput}
                        onChange={(e) => setNewQuestion({...newQuestion, testInput: e.target.value})}
                        placeholder="nums = [2,7,11,15], target = 9"
                      />
                    </div>
                    <div>
                      <Label>Expected Output</Label>
                      <Input
                        value={newQuestion.testOutput}
                        onChange={(e) => setNewQuestion({...newQuestion, testOutput: e.target.value})}
                        placeholder="[0,1]"
                      />
                    </div>
                  </div>

                  <Button onClick={addQuestion} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {questions.map((question) => (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{question.title}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={
                                question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {question.difficulty}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {question.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Security & Monitoring Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>AI Eye Tracking</Label>
                        <p className="text-sm text-gray-500">Monitor student gaze direction</p>
                      </div>
                      <Switch 
                        checked={securitySettings.eyeTracking}
                        onCheckedChange={(checked) => updateSecuritySetting('eyeTracking', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Webcam Monitoring</Label>
                        <p className="text-sm text-gray-500">Require webcam access</p>
                      </div>
                      <Switch 
                        checked={securitySettings.webcamMonitoring}
                        onCheckedChange={(checked) => updateSecuritySetting('webcamMonitoring', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Tab Switch Detection</Label>
                        <p className="text-sm text-gray-500">Alert when students switch tabs</p>
                      </div>
                      <Switch 
                        checked={securitySettings.tabSwitchDetection}
                        onCheckedChange={(checked) => updateSecuritySetting('tabSwitchDetection', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Fullscreen Enforcement</Label>
                        <p className="text-sm text-gray-500">Force fullscreen mode</p>
                      </div>
                      <Switch 
                        checked={securitySettings.fullscreenEnforcement}
                        onCheckedChange={(checked) => updateSecuritySetting('fullscreenEnforcement', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Right-Click Blocking</Label>
                        <p className="text-sm text-gray-500">Disable right-click menu</p>
                      </div>
                      <Switch 
                        checked={securitySettings.rightClickBlocked}
                        onCheckedChange={(checked) => updateSecuritySetting('rightClickBlocked', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Developer Tools Blocking</Label>
                        <p className="text-sm text-gray-500">Detect and block dev tools</p>
                      </div>
                      <Switch 
                        checked={securitySettings.devToolsBlocked}
                        onCheckedChange={(checked) => updateSecuritySetting('devToolsBlocked', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button className="w-full">
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Registered Students</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Student ID</th>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id} className="border-t">
                            <td className="px-4 py-2 font-mono">{student.id}</td>
                            <td className="px-4 py-2">{student.name}</td>
                            <td className="px-4 py-2">
                              <Badge className={getStatusColor(student.status)}>
                                {student.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
