import { useEffect, useState } from 'react';
import { trackCTA } from '../lib/analytics';

export default function Header({ onOpenQuiz }) {
  const [scrolled, setScrolled] = useState(false);

  // Header se compacta ligeramente al hacer scroll (mejor jerarquía visual)
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        raf = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 w-full z-50 px-4 md:px-8 transition-all duration-300 glassmorphism border-b border-white/20 ${
        scrolled ? 'py-2' : 'py-3 md:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a
          href="#top"
          aria-label="Ir al inicio · CURVE"
          className="flex items-center gap-2 transition-transform hover:scale-105"
        >
          <img
            src="/logo.webp"
            alt="CURVE"
            width="160"
            height="56"
            className={`w-auto object-contain transition-all duration-300 ${
              scrolled ? 'h-9 md:h-10' : 'h-10 md:h-14'
            }`}
          />
        </a>

        {/* Navigation */}
        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex items-center gap-1 font-display text-xs tracking-widest font-black uppercase text-gray-500"
        >
          <a
            href="#top"
            className="px-4 py-2.5 rounded-full hover:bg-curvePink/10 hover:text-curveAction transition-all duration-300"
          >
            Inicio
          </a>
          <a
            href="#comprar"
            className="px-4 py-2.5 rounded-full hover:bg-curvePink/10 hover:text-curveAction transition-all duration-300"
          >
            Productos
          </a>
          <a
            href="#beneficios"
            className="px-4 py-2.5 rounded-full hover:bg-curvePink/10 hover:text-curveAction transition-all duration-300"
          >
            Beneficios
          </a>
          <a
            href="#blog"
            className="px-4 py-2.5 rounded-full hover:bg-curvePink/10 hover:text-curveAction transition-all duration-300"
          >
            Blog
          </a>
          <a
            href="#faq"
            className="px-4 py-2.5 rounded-full hover:bg-curvePink/10 hover:text-curveAction transition-all duration-300"
          >
            Preguntas
          </a>
          <button
            type="button"
            onClick={() => {
              trackCTA('header_quiz');
              onOpenQuiz();
            }}
            className="px-4 py-2.5 rounded-full text-curveAction bg-curvePink/10 hover:bg-curvePink/20 transition-all duration-300"
          >
            Hacer test
          </button>
        </nav>

        {/* Action Button Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#comprar"
            onClick={() => trackCTA('header_comprar_desktop')}
            className="flex items-center gap-2 bg-curveAction text-white px-7 py-2.5 rounded-full font-bold hover:brightness-110 hover:scale-105 transition-all shadow-md group"
            aria-label="Ir a la sección de compra"
          >
            Comprar ahora{' '}
            <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>
        </div>

        {/* Mobile Action Buttons */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              trackCTA('header_quiz_mobile');
              onOpenQuiz();
            }}
            className="text-curveAction font-bold text-xs px-2 py-2"
            aria-label="Abrir test de diagnóstico"
          >
            Test
          </button>
          <a
            href="#comprar"
            onClick={() => trackCTA('header_comprar_mobile')}
            className="flex items-center justify-center bg-curveAction text-white px-5 py-2 rounded-full font-bold shadow-md text-sm group"
            aria-label="Ir a la sección de compra"
          >
            Comprar{' '}
            <span aria-hidden="true" className="ml-1 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
