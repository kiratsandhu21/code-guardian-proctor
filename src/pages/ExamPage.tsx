import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Editor from '@monaco-editor/react';
import WebcamMonitor from '@/components/WebcamMonitor';
import SecuritySystem from '@/components/SecuritySystem';
import { Camera, Monitor, Send, Play, Code, Menu, X } from "lucide-react";

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
  const [showProblem, setShowProblem] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Resizable partition state
  const [partitionPosition, setPartitionPosition] = useState(50); // 50% default
  const [isResizing, setIsResizing] = useState(false);
  const partitionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Code validation state
  const [codeErrors, setCodeErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Language templates
  const languageTemplates = {
    javascript: `// Write your solution here
function solution(nums, target) {
    // Your code here
    // Example: Two Sum solution
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    python: `# Write your solution here
def solution(nums, target):
    # Your code here
    # Example: Two Sum solution
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    java: `class Solution {
    public int[] solution(int[] nums, int target) {
        // Your code here
        // Example: Two Sum solution
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
    cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> solution(vector<int>& nums, int target) {
        // Your code here
        // Example: Two Sum solution
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`
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

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowProblem(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

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

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, [studentId, navigate]);

  const addAlert = (message: string) => {
    setAlerts(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(languageTemplates[newLanguage as keyof typeof languageTemplates]);
    setCodeErrors([]);
  };

  const validateCode = (code: string, lang: string) => {
    const errors: string[] = [];
    
    // Basic syntax checks
    if (lang === 'javascript') {
      // Check for basic JavaScript syntax
      if (!code.includes('function') && !code.includes('=>')) {
        errors.push('Missing function definition');
      }
      if (!code.includes('return')) {
        errors.push('Missing return statement');
      }
      // Check for balanced braces
      const openBraces = (code.match(/\{/g) || []).length;
      const closeBraces = (code.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push('Unmatched braces');
      }
    } else if (lang === 'python') {
      // Check for basic Python syntax
      if (!code.includes('def ')) {
        errors.push('Missing function definition');
      }
      if (!code.includes('return')) {
        errors.push('Missing return statement');
      }
      // Check for proper indentation
      const lines = code.split('\n');
      let indentLevel = 0;
      for (const line of lines) {
        if (line.trim().startsWith('def ')) {
          indentLevel = 0;
        } else if (line.trim() && !line.startsWith(' ') && !line.startsWith('\t')) {
          indentLevel = 0;
        } else if (line.trim() && (line.startsWith(' ') || line.startsWith('\t'))) {
          indentLevel++;
        }
      }
    } else if (lang === 'java') {
      // Check for basic Java syntax
      if (!code.includes('class ')) {
        errors.push('Missing class definition');
      }
      if (!code.includes('public ')) {
        errors.push('Missing public method');
      }
      if (!code.includes('return')) {
        errors.push('Missing return statement');
      }
    } else if (lang === 'cpp') {
      // Check for basic C++ syntax
      if (!code.includes('class ')) {
        errors.push('Missing class definition');
      }
      if (!code.includes('public:')) {
        errors.push('Missing public section');
      }
      if (!code.includes('return')) {
        errors.push('Missing return statement');
      }
    }
    
    setCodeErrors(errors);
    return errors.length === 0;
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    
    // Debounced validation
    setIsValidating(true);
    setTimeout(() => {
      validateCode(newCode, language);
      setIsValidating(false);
    }, 500);
  };

  const runCode = async () => {
    // Validate code before running
    if (!validateCode(code, language)) {
      setOutput(`❌ Code validation failed:\n${codeErrors.join('\n')}`);
      return;
    }
    
    setIsRunning(true);
    setOutput('Running...');
    
    try {
      let result = '';
      
      switch (language) {
        case 'javascript':
          result = await executeJavaScript(code);
          break;
        case 'python':
          result = await executePython(code);
          break;
        case 'java':
          result = await executeJava(code);
          break;
        case 'cpp':
          result = await executeCpp(code);
          break;
        default:
          result = 'Unsupported language';
      }
      
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const executeJavaScript = (code: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        // Create a safe execution environment with test cases
        const testCases = [
          { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
          { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
          { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
        ];

        let output = '';
        let passedTests = 0;
        let totalTests = testCases.length;

        testCases.forEach((testCase, index) => {
          try {
            // Create function from user code
            const func = new Function(`
              ${code}
              return solution(${JSON.stringify(testCase.input.nums)}, ${testCase.input.target});
            `);
            
            const result = func();
            const isCorrect = JSON.stringify(result) === JSON.stringify(testCase.expected);
            
            output += `Test Case ${index + 1}:\n`;
            output += `Input: nums = ${JSON.stringify(testCase.input.nums)}, target = ${testCase.input.target}\n`;
            output += `Output: ${JSON.stringify(result)}\n`;
            output += `Expected: ${JSON.stringify(testCase.expected)}\n`;
            output += `Status: ${isCorrect ? 'PASS' : 'FAIL'}\n\n`;
            
            if (isCorrect) passedTests++;
          } catch (error) {
            output += `Test Case ${index + 1}: Runtime Error - ${error}\n\n`;
          }
        });

        output += `\nResults: ${passedTests}/${totalTests} test cases passed`;
        resolve(output);
      } catch (error) {
        resolve(`Compilation Error: ${error}`);
      }
    });
  };

  const executePython = (code: string): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate Python execution with test cases
      const testCases = [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
      ];

      let output = 'Python Execution (Simulated):\n\n';
      let passedTests = 0;
      let totalTests = testCases.length;

      testCases.forEach((testCase, index) => {
        output += `Test Case ${index + 1}:\n`;
        output += `Input: nums = ${JSON.stringify(testCase.input.nums)}, target = ${testCase.input.target}\n`;
        
        // Simple simulation - in real implementation, you'd use a Python runtime
        const simulatedResult = [0, 1]; // Placeholder
        const isCorrect = JSON.stringify(simulatedResult) === JSON.stringify(testCase.expected);
        
        output += `Output: ${JSON.stringify(simulatedResult)}\n`;
        output += `Expected: ${JSON.stringify(testCase.expected)}\n`;
        output += `Status: ${isCorrect ? 'PASS' : 'FAIL'}\n\n`;
        
        if (isCorrect) passedTests++;
      });

      output += `\nResults: ${passedTests}/${totalTests} test cases passed\n`;
      output += `Note: This is a simulation. For real Python execution, integrate with a Python runtime.`;
      resolve(output);
    });
  };

  const executeJava = (code: string): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate Java execution with test cases
      const testCases = [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
      ];

      let output = 'Java Execution (Simulated):\n\n';
      let passedTests = 0;
      let totalTests = testCases.length;

      testCases.forEach((testCase, index) => {
        output += `Test Case ${index + 1}:\n`;
        output += `Input: nums = ${JSON.stringify(testCase.input.nums)}, target = ${testCase.input.target}\n`;
        
        // Simple simulation - in real implementation, you'd use a Java runtime
        const simulatedResult = [0, 1]; // Placeholder
        const isCorrect = JSON.stringify(simulatedResult) === JSON.stringify(testCase.expected);
        
        output += `Output: ${JSON.stringify(simulatedResult)}\n`;
        output += `Expected: ${JSON.stringify(testCase.expected)}\n`;
        output += `Status: ${isCorrect ? 'PASS' : 'FAIL'}\n\n`;
        
        if (isCorrect) passedTests++;
      });

      output += `\nResults: ${passedTests}/${totalTests} test cases passed\n`;
      output += `Note: This is a simulation. For real Java execution, integrate with a Java runtime.`;
      resolve(output);
    });
  };

  const executeCpp = (code: string): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate C++ execution with test cases
      const testCases = [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
        { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
        { input: { nums: [3, 3], target: 6 }, expected: [0, 1] }
      ];

      let output = 'C++ Execution (Simulated):\n\n';
      let passedTests = 0;
      let totalTests = testCases.length;

      testCases.forEach((testCase, index) => {
        output += `Test Case ${index + 1}:\n`;
        output += `Input: nums = ${JSON.stringify(testCase.input.nums)}, target = ${testCase.input.target}\n`;
        
        // Simple simulation - in real implementation, you'd use a C++ compiler
        const simulatedResult = [0, 1]; // Placeholder
        const isCorrect = JSON.stringify(simulatedResult) === JSON.stringify(testCase.expected);
        
        output += `Output: ${JSON.stringify(simulatedResult)}\n`;
        output += `Expected: ${JSON.stringify(testCase.expected)}\n`;
        output += `Status: ${isCorrect ? 'PASS' : 'FAIL'}\n\n`;
        
        if (isCorrect) passedTests++;
      });

      output += `\nResults: ${passedTests}/${totalTests} test cases passed\n`;
      output += `Note: This is a simulation. For real C++ execution, integrate with a C++ compiler.`;
      resolve(output);
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

  // Resize handlers for partition
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Limit resize range (20% to 80%)
    const clampedPosition = Math.max(20, Math.min(80, newPosition));
    setPartitionPosition(clampedPosition);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
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
      <div className="bg-gray-800 border-b border-gray-700 px-3 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Monitor className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            <span className="font-semibold text-sm sm:text-base">ProctorCode Exam</span>
          </div>
          <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs sm:text-sm">
            Student: {studentId}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-xs sm:text-sm">
            Time: <span className="font-mono text-yellow-400">{formatTime(timeRemaining)}</span>
          </div>
          {isMobile && (
            <Button
              onClick={() => setShowProblem(!showProblem)}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
            >
              {showProblem ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}
          <Button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
            size="sm"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Submit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="flex h-full exam-container">
        {/* Problem Description */}
        <div 
          className={`${isMobile ? (showProblem ? 'w-full' : 'hidden') : ''} bg-gray-800 border-r border-gray-700 overflow-y-auto transition-all duration-300`}
          style={!isMobile ? { width: `${partitionPosition}%` } : {}}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h1 className="text-lg sm:text-xl font-bold">{problem.title}</h1>
              <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">{problem.difficulty}</Badge>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                {problem.description}
              </pre>
              
              <div className="mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Constraints:</h3>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index}>{constraint}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Resizable Partition */}
        {!isMobile && (
          <div
            ref={partitionRef}
            className="w-1 bg-gray-600 hover:bg-blue-400 cursor-col-resize transition-colors duration-200 relative group"
            onMouseDown={handleResizeStart}
            style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
          >
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>
        )}

        {/* Code Editor */}
        <div 
          className={`${isMobile ? (showProblem ? 'hidden' : 'w-full') : 'flex-1'} flex flex-col`}
          style={!isMobile ? { width: `${100 - partitionPosition}%` } : {}}
        >
          {/* Language Selector */}
          <div className="bg-gray-700 border-b border-gray-600 p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-300">Language:</span>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-24 sm:w-32 bg-gray-800 border-gray-600 text-xs sm:text-sm">
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
            <div className="flex items-center space-x-2">
              {isValidating && (
                <div className="text-xs text-yellow-400 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400 mr-1"></div>
                  Validating...
                </div>
              )}
              {codeErrors.length > 0 && !isValidating && (
                <div className="text-xs text-red-400 flex items-center">
                  ⚠️ {codeErrors.length} error{codeErrors.length > 1 ? 's' : ''}
                </div>
              )}
              <Button 
                onClick={runCode} 
                disabled={isRunning || codeErrors.length > 0}
                size="sm"
                className={`text-xs sm:text-sm ${
                  codeErrors.length > 0 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {isRunning ? 'Running...' : 'Run'}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="code" className="flex-1 flex flex-col">
            <TabsList className="bg-gray-700 border-b border-gray-600">
              <TabsTrigger value="code" className="text-xs sm:text-sm">Solution</TabsTrigger>
              <TabsTrigger value="output" className="text-xs sm:text-sm">Output</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="flex-1 m-0">
              <div className="h-full">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{
                    fontSize: isMobile ? 12 : 14,
                    fontFamily: 'JetBrains Mono, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    contextmenu: false, // Disable right-click
                    lineNumbers: isMobile ? 'off' : 'on',
                    folding: !isMobile,
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="flex-1 p-2 sm:p-4">
              <div className="bg-gray-900 rounded p-2 sm:p-4 font-mono text-xs sm:text-sm h-full overflow-y-auto">
                {output ? (
                  <div className="space-y-2">
                    <div className="text-green-400 font-semibold">
                      {isRunning ? '🔄 Compiling and Running...' : '✅ Execution Complete'}
                    </div>
                    <div className="border-t border-gray-700 pt-2">
                      <pre className="whitespace-pre-wrap text-gray-300">
                        {output}
                      </pre>
                    </div>
                    {!isRunning && output.includes('test cases passed') && (
                      <div className="border-t border-gray-700 pt-2">
                        <div className="text-blue-400 font-semibold">📊 Summary:</div>
                        <div className="text-gray-400">
                          {output.includes('3/3') ? '🎉 All tests passed!' : '⚠️ Some tests failed'}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="mb-2">💡 Ready to run your code!</div>
                    <div className="text-xs">
                      • Click "Run" to execute your solution<br/>
                      • Your code will be tested against multiple test cases<br/>
                      • Results will show input, output, and expected values
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Monitoring Components */}
      <WebcamMonitor onAlert={addAlert} />
      <SecuritySystem onAlert={addAlert} />
    </div>
  );
};

export default ExamPage;
