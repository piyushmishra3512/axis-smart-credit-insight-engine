import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if device supports hover (desktop)
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    // Only enable custom cursor on desktop devices
    if (isDesktop) {
      const updateCursor = (e) => {
        setPosition({ x: e.clientX, y: e.clientY });
      };

      const handleMouseEnter = (e) => {
        const target = e.target;
        if (
          target.tagName === 'BUTTON' ||
          target.closest('button') ||
          target.tagName === 'A' ||
          target.closest('a') ||
          target.closest('.cursor-pointer') ||
          target.closest('.interactive-element')
        ) {
          setIsHovering(true);
          const button = target.closest('button') || target;
          if (button.textContent) {
            setCursorText(button.textContent.trim().split('\n')[0]);
          }
        }
      };

      const handleMouseLeave = () => {
        setIsHovering(false);
        setCursorText('');
      };

      const handleMouseDown = () => setIsClicking(true);
      const handleMouseUp = () => setIsClicking(false);

      document.addEventListener('mousemove', updateCursor);
      document.addEventListener('mouseenter', handleMouseEnter, true);
      document.addEventListener('mouseleave', handleMouseLeave, true);
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', updateCursor);
        document.removeEventListener('mouseenter', handleMouseEnter, true);
        document.removeEventListener('mouseleave', handleMouseLeave, true);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDesktop]);

  // Don't render on mobile devices
  if (!isDesktop) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div
          className={`w-3 h-3 rounded-full bg-white transition-all duration-300 ${
            isHovering ? 'scale-150' : isClicking ? 'scale-75' : 'scale-100'
          }`}
        />
      </div>

      {/* Outer cursor ring */}
      <div
        className="fixed pointer-events-none z-[9998]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        <div
          className={`rounded-full border-2 border-indigo-500 transition-all duration-300 ${
            isHovering
              ? 'w-12 h-12 border-indigo-400 opacity-80'
              : isClicking
              ? 'w-6 h-6 border-indigo-600 opacity-100'
              : 'w-8 h-8 border-indigo-500 opacity-60'
          }`}
        />
      </div>

      {/* Cursor text label */}
      {isHovering && cursorText && (
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: `${position.x + 20}px`,
            top: `${position.y + 20}px`,
            transition: 'opacity 0.2s ease-out',
          }}
        >
          <div className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap">
            {cursorText}
          </div>
        </div>
      )}

      {/* Magnetic effect particles */}
      {isHovering && (
        <div
          className="fixed pointer-events-none z-[9997]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-indigo-400 rounded-full animate-pulse"
              style={{
                transform: `rotate(${i * 60}deg) translateY(-20px)`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

