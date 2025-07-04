
import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Camera, Minimize2, Maximize2 } from 'lucide-react';

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

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-600 transition-all duration-300">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center space-x-2">
            <Camera className={`h-4 w-4 ${isActive ? 'text-green-400' : 'text-red-400'}`} />
            <span className="text-xs text-gray-300">Webcam Monitor</span>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
          
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </button>
        </div>
        
        {!isMinimized && (
          <>
            <div className="relative px-2">
              <video
                ref={videoRef}
                className="w-32 h-24 bg-gray-900 rounded"
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-2 w-32 h-24 pointer-events-none"
              />
            </div>
            
            <div className="text-xs text-gray-400 p-2 pt-1 text-center">
              AI Monitoring Active
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WebcamMonitor;
