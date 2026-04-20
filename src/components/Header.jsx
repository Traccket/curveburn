import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function Header({ onOpenQuiz }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4 transition-all duration-300 glassmorphism border-b border-white/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 transition-transform hover:scale-105">
          <img src="/logo.png" alt="CURVE Logo" className="h-16 md:h-24 object-contain" />
        </a>

        {/* Navigation Middle */}
        <nav className="hidden lg:flex items-center gap-2 font-display text-xs tracking-widest font-black uppercase text-gray-500">
          <a href="#" className="px-5 py-2.5 rounded-full hover:bg-curvePink/10 hover:text-curveAction transition-all duration-300">Inicio</a>
          <a href="#comprar" className="px-5 py-2.5 rounded-full hover:bg-curvePink/10 hover:text-curveAction transition-all duration-300">Productos</a>
          <a href="#beneficios" className="px-5 py-2.5 rounded-full hover:bg-curvePink/10 hover:text-curveAction transition-all duration-300">Beneficios</a>
          <a href="#blog" className="px-5 py-2.5 rounded-full hover:bg-curvePink/10 hover:text-curveAction transition-all duration-300">Blog</a>
          <button onClick={onOpenQuiz} className="px-5 py-2.5 rounded-full text-curveAction bg-curvePink/10 hover:bg-curvePink/20 transition-all duration-300">Hacer test</button>
        </nav>

        {/* Action Button Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <a href="#comprar" className="flex items-center gap-2 bg-curveAction text-white px-8 py-3 rounded-full font-bold hover:brightness-110 hover:scale-105 transition-all shadow-md group">
            Comprar ahora <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {/* Mobile Action Button */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={onOpenQuiz} className="text-curveAction font-bold text-xs px-2 py-2">
            Test
          </button>
          <a href="#comprar" className="flex items-center justify-center bg-curveAction text-white px-5 py-2 rounded-full font-bold shadow-md text-sm group">
            Comprar <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

      </div>
    </header>
  );
}
