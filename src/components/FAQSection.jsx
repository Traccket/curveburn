import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: '¿Cuáles son sus beneficios?',
      a: 'CURVE ayuda al equilibrio metabólico, fuerza la termogénesis natural y contribuye a mantener el apetito bajo control mediante inhibidores naturales. Su uso constante acelera la reducción de medidas en zonas problemáticas.'
    },
    {
      q: '¿Cómo se usan?',
      a: 'Debes consumir la cápsula recomendada a diario, preferiblemente en la mañana junto con agua.'
    },
    {
      q: '¿Dónde lo puedo conseguir?',
      a: 'Nuestros productos son de venta exclusiva en Colombia a través de esta página con envío asegurado.'
    },
    {
      q: '¿Cuáles son sus ingredientes?',
      a: 'Contamos con una formulación clínica limpia: adaptógenos botánicos, cafeína anhidra estabilizada y cofactores metabólicos naturales. (100% Sin efecto rebote).'
    },
    {
      q: '¿Envían a todo el país?',
      a: 'Sí, contamos con opción de envío con pago contra entrega en ciudades principales (Como Medellín y Bogotá) y envío cubierto nacional al resto del país.'
    }
  ];

  return (
    <section id="faq" className="py-24 max-w-6xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24">
      
      {/* Left side Titles */}
      <div className="w-full lg:w-1/3 flex flex-col items-start text-left">
        <h2 className="text-4xl md:text-[3.5rem] font-bold text-curveAction mb-2 leading-tight">Preguntas frecuentes</h2>
        <h3 className="text-xl md:text-2xl font-semibold text-curveAction/80 mt-2">¿Tienes dudas?</h3>
        <p className="text-gray-500 mt-2 text-lg">Estamos aquí para asesorarte</p>
        
        <button className="mt-8 bg-curveAction text-white font-bold py-3 px-8 rounded-full shadow-md flex items-center justify-center gap-2 hover:brightness-110 group transition-all">
          Contáctanos <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Right side Accordions */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div 
              key={idx} 
              className={`rounded-3xl transition-colors duration-300 ${isOpen ? 'bg-[#FCF5F8]' : 'bg-[#FCF5F8]/40 hover:bg-[#FCF5F8]/80'}`}
            >
              <button 
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                className="w-full text-left p-6 font-bold text-lg text-curveAction flex justify-between items-center"
              >
                <span>{faq.q}</span>
                {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 pb-6 px-6' : 'max-h-0 opacity-0 px-6'}`}
              >
                <p className="text-gray-700 leading-relaxed text-sm">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
