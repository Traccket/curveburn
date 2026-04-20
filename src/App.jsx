import { useState } from 'react';
import HeroSection from './components/HeroSection';
import StickyAddToCart from './components/StickyAddToCart';
import BentoGrid from './components/BentoGrid';
import CurveProtocolSection from './components/CurveProtocolSection';
import UGCProof from './components/UGCProof';
import CurvePath from './components/CurvePath';
import Header from './components/Header';
import ExitIntentModal from './components/ExitIntentModal';
import LogosSection from './components/LogosSection';
import MarqueeBanner from './components/MarqueeBanner';
import FAQSection from './components/FAQSection';
import QuizModal from './components/QuizModal';
import BlogSection from './components/BlogSection';

function App() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  return (
    <main className="relative min-h-screen font-sans bg-background selection:bg-curvePink selection:text-white overflow-hidden">
      
      {/* Global Modals & Navigation */}
      <Header onOpenQuiz={() => setIsQuizOpen(true)} />
      <ExitIntentModal />
      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />

      {/* Background Graphic elements */}
      <CurvePath />

      {/* Hero Section with Pricing */}
      <HeroSection />

      {/* Trust & Prensa */}
      <LogosSection />

      {/* Tira Movible */}
      <MarqueeBanner />

      {/* Bento Grid: Science behind CURVE */}
      <BentoGrid />

      {/* Curve Method: Protocols */}
      <CurveProtocolSection />

      {/* Blog & Science */}
      <BlogSection />

      {/* FAQ Accordion Section */}
      <FAQSection />

      {/* UGC / Social Proof Testimonials */}
      <UGCProof />

      {/* Marketing Footer */}
      <footer className="text-center py-10 text-gray-500 font-medium text-sm border-t border-gray-200 relative z-10 glassmorphism">
        <p>© {new Date().getFullYear()} CURVE High-Performance Nutrition. Todos los derechos reservados.</p>
      </footer>

      {/* Mobile Sticky CTA */}
      <StickyAddToCart />

    </main>
  );
}

export default App;
