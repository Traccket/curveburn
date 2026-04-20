import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronRight } from 'lucide-react';
import ProtocolModal from './ProtocolModal';

gsap.registerPlugin(ScrollTrigger);

const PROTOCOLS = [
  {
    id: 1,
    title: "El Switch de Quema de Grasa.",
    subtitle: "Ayuno Intermitente Metabólico (16:8)",
    body: "Potencia el efecto de CURVE tomando tu dosis 30 minutos antes de romper el ayuno. Esto obliga a tu cuerpo a utilizar las reservas de tejido adiposo como fuente primaria de energía durante tu ventana de ayuno.",
    tip: "Agrega café negro o té verde sin azúcar para un boost de termogénesis sin romper el estado de cetosis."
  },
  {
    id: 2,
    title: "Alimenta tu Definición.",
    subtitle: "Nutrición Anti-Inflamatoria",
    body: "Prioriza grasas saludables (aguacate, nueces) y proteínas de alta biodisponibilidad. CURVE funciona mejor en un entorno de baja insulina. Reduce harinas refinadas para evitar la retención de líquidos.",
    tip: "Sustituye el azúcar por stevia o eritritol para mantener el algoritmo de tu cuerpo en 'Modo Quema'."
  },
  {
    id: 3,
    title: "El Transporte de Toxinas.",
    subtitle: "Hidratación de Precisión",
    body: "La lipólisis (quema de grasa) genera residuos que tu cuerpo debe expulsar. Bebe 35ml de agua por cada kilo de peso. Una hidratación óptima acelera la velocidad a la que CURVE procesa los depósitos de grasa rebelde.",
    tip: "Añade una pizca de sal marina y limón a tu primera agua del día para balancear electrolitos."
  },
  {
    id: 4,
    title: "Quema mientras descansas.",
    subtitle: "El Ciclo del Sueño y Cortisol",
    body: "El cortisol alto bloquea la pérdida de peso en el abdomen. CURVE ayuda a regular tu energía, pero 7-8 horas de sueño profundo son el 'cierre de ciclo' necesario para que el músculo se recupere y la grasa se oxide.",
    tip: "Evita pantallas 1 hora antes de dormir para que tu melatonina trabaje a tu favor."
  }
];

export default function CurveProtocolSection() {
  const containerRef = useRef(null);
  const [activeProtocol, setActiveProtocol] = useState(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".protocol-card", 
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative z-10 py-24 px-6 curve-trigger bg-[#1A1A1A] rounded-[48px] mx-4 md:mx-auto max-w-7xl overflow-hidden shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-curvePurple opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-white">
          The <span className="text-gradient">Curve Method</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Protocolos de bio-hacking diseñados para maximizar la eficacia de tu dosis diaria de CURVE.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto relative z-10">
        {PROTOCOLS.map((protocol, index) => (
          <div 
            key={protocol.id} 
            className="protocol-card glassmorphism !bg-white/10 !border-white/20 p-8 rounded-4xl hover:!bg-white/20 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-curvePink font-mono text-sm tracking-widest uppercase">Protocolo 0{index + 1}</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-curvePink transition-colors">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{protocol.subtitle}</h3>
            <p className="text-gray-300 text-sm italic mb-6">"{protocol.title}"</p>
            
            <button 
              onClick={() => setActiveProtocol(protocol)}
              className="mt-auto inline-block border border-white/30 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-white hover:text-[#1A1A1A] transition-colors"
            >
              Ver protocolo completo
            </button>
          </div>
        ))}
      </div>

      <ProtocolModal 
        isOpen={!!activeProtocol} 
        onClose={() => setActiveProtocol(null)} 
        protocol={activeProtocol} 
      />
    </section>
  );
}
