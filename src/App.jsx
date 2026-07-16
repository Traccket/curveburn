import { useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import TrustBar from './components/TrustBar';
import MarqueeBanner from './components/MarqueeBanner';
import BentoGrid from './components/BentoGrid';
import CurveProtocolSection from './components/CurveProtocolSection';
import UGCProof from './components/UGCProof';
import BlogSection from './components/BlogSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import CurvePath from './components/CurvePath';
import ExitIntentModal from './components/ExitIntentModal';
import QuizModal from './components/QuizModal';
import StickyAddToCart from './components/StickyAddToCart';
import CookieBanner from './components/CookieBanner';
import CheckoutFlow from './components/CheckoutFlow';

function App() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  return (
    <main
      id="top"
      className="relative min-h-screen font-sans bg-background selection:bg-curvePink selection:text-white overflow-hidden pb-24 md:pb-0"
    >
      {/* Global: nav + modals + banners */}
      <Header onOpenQuiz={() => setIsQuizOpen(true)} />
      <ExitIntentModal />
      <QuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <CookieBanner />
      {/* Puerta de ciudad + checkout contra-entrega (Sendura) o Shopify */}
      <CheckoutFlow />

      {/* Fondo decorativo */}
      <CurvePath />

      {/* Hero + pricing (con social proof arriba del H1) */}
      <HeroSection />

      {/* Trust bar reemplaza la sección de prensa falsa (Forbes/Oprah/Vogue) */}
      <TrustBar />

      {/* Testimonios cerca del hero — prueba social visible en el scroll inicial */}
      <UGCProof />

      {/* Tira movible */}
      <MarqueeBanner />

      {/* Bento Grid: ciencia detrás de CURVE */}
      <BentoGrid />

      {/* Curve Method: protocolos */}
      <CurveProtocolSection />

      {/* Blog & ciencia */}
      <BlogSection />

      {/* FAQ */}
      <FAQSection />

      {/* Footer legal + contacto */}
      <Footer />

      {/* Sticky CTA solo mobile */}
      <StickyAddToCart />
    </main>
  );
}

export default App;
