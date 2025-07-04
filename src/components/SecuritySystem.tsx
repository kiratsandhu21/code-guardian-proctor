
import { useEffect, useRef, useState } from 'react';
import { Shield } from 'lucide-react';

interface SecuritySystemProps {
  onAlert: (message: string) => void;
}

const SecuritySystem = ({ onAlert }: SecuritySystemProps) => {
  const [isActive, setIsActive] = useState(true);
  const tabSwitchCount = useRef(0);
  const lastVisibilityChange = useRef(Date.now());

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onAlert('Right-click disabled during exam');
    };

    // Disable copy/paste/cut
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x'))
      ) {
        e.preventDefault();
        onAlert('Keyboard shortcut blocked');
      }

      // Detect Alt+Tab (tab switching attempt)
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        onAlert('Tab switching attempt detected');
      }
    };

    // Monitor tab visibility changes
    const handleVisibilityChange = () => {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChange.current;
      
      if (document.hidden && timeSinceLastChange > 1000) {
        tabSwitchCount.current++;
        onAlert(`Tab switch detected (${tabSwitchCount.current})`);
        
        if (tabSwitchCount.current >= 3) {
          onAlert('Multiple tab switches - exam flagged for review');
        }
      }
      
      lastVisibilityChange.current = now;
    };

    // Monitor fullscreen changes
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onAlert('Exited fullscreen mode - exam security compromised');
      }
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      // Allow selection only in Monaco editor
      const target = e.target as HTMLElement;
      if (!target.closest('.monaco-editor')) {
        e.preventDefault();
      }
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Monitor for developer tools
    const detectDevTools = () => {
      const threshold = 160;
      
      setInterval(() => {
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          onAlert('Developer tools detected');
        }
      }, 1000);
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Start developer tools detection
    detectDevTools();

    // Disable browser back button
    const handlePopState = () => {
      onAlert('Navigation attempt blocked');
      window.history.pushState(null, '', window.location.href);
    };
    
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onAlert]);

  // Monitor for suspicious behavior patterns
  useEffect(() => {
    let rapidClickCount = 0;
    let rapidClickTimer: NodeJS.Timeout;

    const handleClick = () => {
      rapidClickCount++;
      
      clearTimeout(rapidClickTimer);
      rapidClickTimer = setTimeout(() => {
        if (rapidClickCount > 10) {
          onAlert('Suspicious clicking pattern detected');
        }
        rapidClickCount = 0;
      }, 2000);
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
      clearTimeout(rapidClickTimer);
    };
  }, [onAlert]);

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-gray-800 rounded-lg p-2 border border-gray-600">
        <div className="flex items-center space-x-2">
          <Shield className={`h-4 w-4 ${isActive ? 'text-green-400' : 'text-red-400'}`} />
          <span className="text-xs text-gray-300">Security Active</span>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        
        <div className="text-xs text-gray-400 mt-1">
          Monitoring: {tabSwitchCount.current} violations
        </div>
      </div>
    </div>
  );
};

export default SecuritySystem;
