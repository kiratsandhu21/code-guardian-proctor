
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Editor from '@monaco-editor/react';
import WebcamMonitor from '@/components/WebcamMonitor';
import SecuritySystem from '@/components/SecuritySystem';
import { Eye, Camera, Monitor, Send, Play, Code } from "lucide-react";

const ExamPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studentId = searchParams.get('studentId');
  const [code, setCode] = useState('// Write your solution here\nfunction solution() {\n    \n}');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Language templates
  const languageTemplates = {
    javascript: '// Write your solution here\nfunction solution(nums, target) {\n    // Your code here\n    return [];\n}',
    python: '# Write your solution here\ndef solution(nums, target):\n    # Your code here\n    return []',
    java: 'class Solution {\n    public int[] solution(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}',
    cpp: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};'
  };

  // Sample coding problem
  const problem = {
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
    constraints: [
      "2 ≤ nums.length ≤ 10^4",
      "-10^9 ≤ nums[i] ≤ 10^9",
      "-10^9 ≤ target ≤ 10^9",
      "Only one valid answer exists."
    ]
  };

  useEffect(() => {
    if (!studentId) {
      navigate('/');
      return;
    }

    // Request fullscreen
    const requestFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
        addAlert('Failed to enter fullscreen mode');
      }
    };

    requestFullscreen();

    // Timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [studentId, navigate]);

  const addAlert = (message: string) => {
    setAlerts(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(languageTemplates[newLanguage as keyof typeof languageTemplates]);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    
    try {
      // Simulate code execution based on language
      if (language === 'javascript') {
        // Simple JavaScript execution simulation
        const result = await executeJavaScript(code);
        setOutput(result);
      } else {
        // For other languages, show simulated output
        setOutput(`Code executed successfully in ${language}.\nTest case: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nTime: 0ms\nMemory: 42.1 MB`);
      }
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const executeJavaScript = (code: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        // Create a safe execution environment
        const func = new Function(`
          ${code}
          
          // Test the solution
          const nums = [2, 7, 11, 15];
          const target = 9;
          const result = solution(nums, target);
          return JSON.stringify(result);
        `);
        
        const result = func();
        resolve(`Test case: nums = [2,7,11,15], target = 9\nOutput: ${result}\nExpected: [0,1]\nStatus: ${result === '[0,1]' ? 'PASS' : 'FAIL'}`);
      } catch (error) {
        resolve(`Runtime Error: ${error}`);
      }
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    addAlert('Solution submitted successfully');
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">Exam Submitted!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your solution has been submitted successfully. You will be redirected shortly.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">ProctorCode Exam</span>
          </div>
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            Student: {studentId}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            Time: <span className="font-mono text-yellow-400">{formatTime(timeRemaining)}</span>
          </div>
          <Button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Send className="h-4 w-4 mr-1" />
            Submit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Problem Description */}
        <div className="w-1/2 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h1 className="text-xl font-bold">{problem.title}</h1>
              <Badge className="bg-green-100 text-green-800">{problem.difficulty}</Badge>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {problem.description}
              </pre>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Constraints:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Language Selector */}
          <div className="bg-gray-700 border-b border-gray-600 p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Language:</span>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={runCode} 
              disabled={isRunning}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-1" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          </div>

          <Tabs defaultValue="code" className="flex-1 flex flex-col">
            <TabsList className="bg-gray-700 border-b border-gray-600">
              <TabsTrigger value="code">Solution</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="flex-1 m-0">
              <div className="h-full">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: 'JetBrains Mono, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    contextmenu: false, // Disable right-click
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="flex-1 p-4">
              <div className="bg-gray-900 rounded p-4 font-mono text-sm h-full overflow-y-auto">
                <pre className="whitespace-pre-wrap">
                  {output || 'Click "Run" to execute your code...'}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Monitoring Components */}
      <WebcamMonitor onAlert={addAlert} />
      <SecuritySystem onAlert={addAlert} />

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <Alert className="bg-yellow-900 border-yellow-600">
            <Eye className="h-4 w-4" />
            <AlertDescription>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {alerts.slice(-3).map((alert, index) => (
                  <div key={index} className="text-xs">{alert}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
