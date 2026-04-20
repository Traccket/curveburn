import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CurvePath() {
  const pathRef = useRef(null);
  
  useEffect(() => {
    // Basic fluid animation for the curved path
    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 3,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: ".curve-trigger",
        start: "top center",
        end: "bottom center",
        scrub: 1
      }
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        className="w-full h-[200vh]"
      >
        <path
          ref={pathRef}
          d="M 50 0 C 80 20, 20 50, 50 100"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="0.5"
          strokeDasharray="200"
          strokeDashoffset="200"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D982B5" />
            <stop offset="100%" stopColor="#8B7EB5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
