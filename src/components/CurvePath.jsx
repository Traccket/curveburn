import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CurvePath() {
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    // Respeta preferencia de reducir animaciones (accesibilidad)
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      gsap.set(path, { strokeDashoffset: 0 });
      return;
    }

    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-[200vh]"
      >
        <path
          ref={pathRef}
          d="M 50 0 C 80 20, 20 50, 50 100"
          fill="none"
          stroke="url(#curve-gradient-line)"
          strokeWidth="0.5"
          strokeDasharray="200"
          strokeDashoffset="200"
        />
        <defs>
          <linearGradient id="curve-gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D982B5" />
            <stop offset="100%" stopColor="#8B7EB5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
