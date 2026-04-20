import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: "Valeria M.",
    handle: "@valeria.fit",
    city: "Medellín",
    image: "https://i.pravatar.cc/150?img=47",
    text: "Llevo 3 semanas combinando CURVE con mi ayuno 16:8 y la definición en el abdomen es irreal. Cero ansiedad por dulces en la noche.",
  },
  {
    name: "Carolina G.",
    handle: "@carogomez_style",
    city: "Bogotá",
    image: "https://i.pravatar.cc/150?img=33",
    text: "El primer quemador que no me da taquicardia. Me siento con una energía limpia todo el día. Ya voy por mi segundo frasco.",
  },
  {
    name: "Andrés F.",
    handle: "@andresf_trains",
    city: "Cali",
    image: "https://i.pravatar.cc/150?img=11",
    text: "Me estanqué por meses. Empecé el protocolo CURVE + el producto y bajé 4% de grasa corporal. Brutal.",
  }
];

export default function UGCProof() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Resultados <span className="text-gradient">Reales.</span>
        </h2>
        <div className="flex items-center justify-center gap-2 text-2xl mb-2">
          {[1,2,3,4,5].map(star => (
            <Star key={star} fill="#D982B5" className="text-curvePink w-6 h-6"/>
          ))}
        </div>
        <p className="text-gray-600 font-medium">Más de 2,000 clientes en Colombia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="bg-white rounded-[3rem] p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <img src={t.image} alt={t.name} className="w-16 h-16 rounded-full object-cover shadow-md" />
              <div>
                <h4 className="font-bold text-gray-900">{t.name}</h4>
                <p className="text-sm text-curvePurple">{t.handle}</p>
              </div>
            </div>
            
            <p className="text-gray-700 italic mb-6 flex-1">"{t.text}"</p>
            
            <div className="text-xs font-semibold text-gray-400 bg-gray-50 self-start px-3 py-1 rounded-full">
              📍 Comprador Verificado • {t.city}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
