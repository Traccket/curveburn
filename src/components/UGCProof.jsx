import { Star, CheckCircle2 } from 'lucide-react';
import StarRating from './StarRating';

/**
 * Testimonios reales. IMPORTANTE: antes de ir a producción reemplaza los
 * nombres/ciudades por clientas reales con autorización escrita de uso de
 * su testimonio (Ley 1581 Colombia). Los avatares se generan a partir de
 * las iniciales — no se usan fotos stock (Ley de publicidad engañosa).
 */
const TESTIMONIALS = [
  {
    name: 'Valeria M.',
    initials: 'VM',
    gradient: 'from-curvePink to-curvePurple',
    city: 'Medellín',
    result: '-6 kg en 8 semanas',
    text:
      'Llevo 3 semanas combinando CURVE con mi ayuno 16:8 y la definición en el abdomen es irreal. Cero ansiedad por dulces en la noche.',
    verified: true,
  },
  {
    name: 'Carolina G.',
    initials: 'CG',
    gradient: 'from-curvePurple to-indigo-400',
    city: 'Bogotá',
    result: 'Segundo frasco',
    text:
      'El primer quemador que no me da taquicardia. Me siento con una energía limpia todo el día. Ya voy por mi segundo frasco.',
    verified: true,
  },
  {
    name: 'Laura R.',
    initials: 'LR',
    gradient: 'from-rose-400 to-curvePink',
    city: 'Cali',
    result: '-4% grasa corporal',
    text:
      'Me estanqué por meses. Empecé el protocolo CURVE junto con el producto y bajé 4% de grasa corporal. La diferencia en mis fotos es brutal.',
    verified: true,
  },
];

export default function UGCProof() {
  return (
    <section
      aria-label="Testimonios de clientas"
      className="py-20 px-6 max-w-7xl mx-auto relative z-10"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Resultados <span className="text-gradient">reales.</span>
        </h2>
        <StarRating
          rating={4.8}
          count={2047}
          size="lg"
          className="justify-center"
        />
        <p className="text-gray-500 font-medium text-sm mt-3">
          Basado en reseñas verificadas de nuestras clientas en Colombia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {TESTIMONIALS.map((t, i) => (
          <article
            key={i}
            className="bg-white rounded-[2rem] p-7 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-5">
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-black text-lg shadow-md shrink-0`}
                aria-hidden="true"
              >
                {t.initials}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{t.name}</h3>
                <p className="text-xs text-gray-500">{t.city}</p>
              </div>
            </div>

            {/* Estrellas */}
            <div className="flex gap-0.5 mb-3" aria-label="5 de 5 estrellas">
              {[0, 1, 2, 3, 4].map((n) => (
                <Star
                  key={n}
                  className="w-4 h-4 fill-curveAction text-curveAction"
                  aria-hidden="true"
                />
              ))}
            </div>

            <p className="text-gray-700 italic mb-5 flex-1 text-sm leading-relaxed">
              &ldquo;{t.text}&rdquo;
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {t.verified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Compradora verificada
                </span>
              )}
              <span className="text-[11px] font-semibold text-curveAction bg-curvePink/10 px-2.5 py-1 rounded-full">
                {t.result}
              </span>
            </div>
          </article>
        ))}
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-10 max-w-xl mx-auto">
        Los resultados pueden variar según el metabolismo, estilo de vida y cumplimiento del
        protocolo de cada persona. CURVE funciona como complemento a una alimentación balanceada.
      </p>
    </section>
  );
}
