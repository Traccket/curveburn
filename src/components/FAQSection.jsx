import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { trackCTA } from '../lib/analytics';

// Reemplazar con el número real en producción. Se detecta automáticamente
// como placeholder y se deshabilita el enlace para no generar 404s en wa.me.
const WHATSAPP_NUMBER = '[WHATSAPP]';
const WHATSAPP_IS_CONFIGURED = /^\d{8,15}$/.test(WHATSAPP_NUMBER);
const WHATSAPP_HREF = WHATSAPP_IS_CONFIGURED
  ? `https://wa.me/57${WHATSAPP_NUMBER}`
  : undefined;

const FAQS = [
  {
    q: '¿Cuáles son los beneficios de CURVE?',
    a: 'CURVE ayuda al equilibrio metabólico, activa la termogénesis natural y contribuye a controlar el apetito mediante inhibidores naturales. Su uso constante, acompañado de hábitos saludables, apoya la reducción de medidas en zonas problemáticas.',
  },
  {
    q: '¿Cómo se toma?',
    a: 'La dosis recomendada es una cápsula al día, preferiblemente en la mañana con un vaso grande de agua. Evita combinarlo con otros estimulantes fuertes.',
  },
  {
    q: '¿Dónde puedo conseguirlo?',
    a: 'Nuestros productos son de venta exclusiva en Colombia a través de esta página, con envío asegurado por transportadora nacional.',
  },
  {
    q: '¿Qué contiene la fórmula?',
    a: 'Fórmula limpia con adaptógenos botánicos, cafeína anhidra estabilizada y cofactores metabólicos naturales. Sin azúcares, sin gluten, sin efecto rebote.',
  },
  {
    q: '¿Envían a todo el país?',
    a: 'Sí. Pago contra entrega disponible en las ciudades principales (Medellín, Bogotá, Cali, Barranquilla, Bucaramanga y más). Para el resto del país enviamos con pago anticipado por transportadora nacional.',
  },
  {
    q: '¿Hay garantía de devolución?',
    a: 'Sí. Ofrecemos garantía de satisfacción de 30 días. Si no estás a gusto con el producto, contáctanos y te devolvemos el valor de tu compra según nuestra política de devoluciones.',
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    const next = openIdx === idx ? -1 : idx;
    setOpenIdx(next);
    if (next !== -1) trackCTA(`faq_open_${idx}`);
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="py-24 max-w-6xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24"
    >
      <div className="w-full lg:w-1/3 flex flex-col items-start text-left">
        <h2
          id="faq-title"
          className="text-4xl md:text-[3.5rem] font-bold text-curveAction mb-2 leading-tight"
        >
          Preguntas frecuentes
        </h2>
        <h3 className="text-xl md:text-2xl font-semibold text-curveAction/80 mt-2">
          ¿Tienes dudas?
        </h3>
        <p className="text-gray-500 mt-2 text-lg">Estamos aquí para asesorarte.</p>

        {WHATSAPP_IS_CONFIGURED ? (
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTA('faq_whatsapp')}
            className="mt-8 bg-curveAction text-white font-bold py-3 px-8 rounded-full shadow-md flex items-center justify-center gap-2 hover:brightness-110 group transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-curveAction"
          >
            Escríbenos por WhatsApp{' '}
            <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Configura el número de WhatsApp en FAQSection.jsx"
            className="mt-8 bg-gray-400 text-white font-bold py-3 px-8 rounded-full shadow-md flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
          >
            WhatsApp (pendiente de configurar)
          </button>
        )}
      </div>

      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          const panelId = `faq-panel-${idx}`;
          const btnId = `faq-btn-${idx}`;
          return (
            <div
              key={idx}
              className={`rounded-3xl transition-colors duration-300 ${
                isOpen ? 'bg-[#FCF5F8]' : 'bg-[#FCF5F8]/40 hover:bg-[#FCF5F8]/80'
              }`}
            >
              <button
                id={btnId}
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full text-left p-6 font-bold text-lg text-curveAction flex justify-between items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction rounded-3xl"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <Minus className="w-5 h-5 shrink-0" aria-hidden="true" />
                ) : (
                  <Plus className="w-5 h-5 shrink-0" aria-hidden="true" />
                )}
              </button>

              {/*
                No usamos el atributo HTML `hidden` porque neutraliza
                cualquier transición CSS (el navegador aplica display:none).
                En su lugar controlamos visibilidad/tamaño vía clases y
                marcamos el contenido como inaccesible con aria-hidden
                y tabIndex cuando está colapsado.
              */}
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                aria-hidden={!isOpen}
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  isOpen ? 'max-h-96 opacity-100 pb-6 px-6' : 'max-h-0 opacity-0 px-6 pointer-events-none'
                }`}
              >
                <p className="text-gray-700 leading-relaxed text-sm">{faq.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
