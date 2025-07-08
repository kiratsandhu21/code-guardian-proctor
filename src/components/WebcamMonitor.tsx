import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Camera, Minimize2, Maximize2, Move } from 'lucide-react';

interface WebcamMonitorProps {
  onAlert: (message: string) => void;
}

const WebcamMonitor = ({ onAlert }: WebcamMonitorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [lastFaceDetection, setLastFaceDetection] = useState(Date.now());
  const alertTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Drag state
  const [position, setPosition] = useState({ x: 16, y: window.innerHeight - 120 }); // bottom-4 left-4
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const webcamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const initializeCamera = async () => {
      try {
        // Load TensorFlow.js and BlazeFace model
        await tf.ready();
        const loadedModel = await blazeface.load();
        setModel(loadedModel);
        
        // Get webcam stream
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 },
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsActive(true);
          startFaceDetection();
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
        onAlert('Failed to access webcam - exam security compromised');
      }
    };

    const startFaceDetection = () => {
      const detectFaces = async () => {
        if (!model || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.videoWidth === 0) return;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try {
          // Detect faces
          const predictions = await model.estimateFaces(video, false);
          
          if (predictions.length > 0) {
            setLastFaceDetection(Date.now());
            
            // Draw face detection box
            predictions.forEach((prediction) => {
              const start = prediction.topLeft as [number, number];
              const end = prediction.bottomRight as [number, number];
              const size = [end[0] - start[0], end[1] - start[1]];

              ctx.strokeStyle = '#00ff00';
              ctx.lineWidth = 2;
              ctx.strokeRect(start[0], start[1], size[0], size[1]);
            });

            // Basic gaze detection (simplified)
            if (predictions.length > 1) {
              onAlert('Multiple faces detected');
            }
          } else {
            // No face detected
            const timeSinceLastFace = Date.now() - lastFaceDetection;
            if (timeSinceLastFace > 3000) { // 3 seconds
              onAlert('Student not looking at screen');
            }
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
      };

      // Run detection every 500ms
      const detectionInterval = setInterval(detectFaces, 500);
      
      return () => clearInterval(detectionInterval);
    };

    initializeCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, [onAlert]);

  // Monitor for webcam access revocation
  useEffect(() => {
    const checkCameraStatus = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const videoTrack = stream.getVideoTracks()[0];
        
        if (videoTrack && videoTrack.readyState === 'ended') {
          onAlert('Webcam access revoked - exam security compromised');
          setIsActive(false);
        }
      }
    };

    const statusInterval = setInterval(checkCameraStatus, 1000);
    return () => clearInterval(statusInterval);
  }, [onAlert]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!webcamRef.current) return;
    
    const rect = webcamRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - (webcamRef.current?.offsetWidth || 150);
    const maxY = window.innerHeight - (webcamRef.current?.offsetHeight || 120);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div 
      ref={webcamRef}
      className="fixed z-50 cursor-move select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: isDragging ? 'none' : 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-gray-800 rounded-lg border border-gray-600 transition-all duration-300">
        <div className="flex items-center justify-between p-1.5 sm:p-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <Camera className={`h-3 w-3 sm:h-4 sm:w-4 ${isActive ? 'text-green-400' : 'text-red-400'}`} />
            <span className="text-xs text-gray-300">Webcam</span>
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
            <Move className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500 opacity-60" />
          </div>
          
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white transition-colors p-0.5 sm:p-1"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            ) : (
              <Minimize2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            )}
          </button>
        </div>
        
        {!isMinimized && (
          <>
            <div className="relative px-1.5 sm:px-2">
              <video
                ref={videoRef}
                className="w-24 h-18 sm:w-32 sm:h-24 bg-gray-900 rounded"
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-1.5 sm:left-2 w-24 h-18 sm:w-32 sm:h-24 pointer-events-none"
              />
            </div>
            
            <div className="text-xs text-gray-400 p-1.5 sm:p-2 pt-0.5 sm:pt-1 text-center">
              AI Monitoring Active
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WebcamMonitor;
