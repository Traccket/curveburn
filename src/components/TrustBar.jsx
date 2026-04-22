import { Truck, CreditCard, ShieldCheck, Leaf } from 'lucide-react';

/**
 * Barra de trust signals — reemplaza la sección de prensa FALSA anterior
 * (Forbes/Oprah/Vogue, que era riesgo de publicidad engañosa en Colombia).
 * Estos son valores reales y defendibles.
 */
const TRUST_ITEMS = [
  {
    icon: Truck,
    title: 'Envío a todo Colombia',
    sub: 'Gratis con suscripción',
  },
  {
    icon: CreditCard,
    title: 'Pago contra entrega',
    sub: 'En ciudades principales',
  },
  {
    icon: ShieldCheck,
    title: 'Garantía 30 días',
    sub: 'Devolución sin preguntas',
  },
  {
    icon: Leaf,
    title: '100% Natural',
    sub: 'Sin efecto rebote',
  },
];

export default function TrustBar() {
  return (
    <section
      aria-label="Razones para confiar en CURVE"
      className="py-10 bg-white/40 border-y border-white/50 backdrop-blur-sm relative z-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, sub }, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-2">
              <div className="w-11 h-11 rounded-full bg-curvePink/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-curveAction" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-textPrimary leading-tight">{title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
