import { ArrowRight } from 'lucide-react';

export default function BentoGrid() {
  const features = [
    {
      title: 'Termogénesis Inteligente',
      desc: 'Sube la temperatura y fuerza al cuerpo a oxidar la grasa rebelde.',
      bg: 'bg-[#C7A3C8]', // Soft Purple
      image: '/beneficio-1.webp',
      width: 1024,
      height: 666
    },
    {
      title: 'Control de Ansiedad',
      desc: 'Bloquea atracones y regula el cortisol durante todo el día de forma natural.',
      bg: 'bg-[#F2A7B8]', // Soft Pink/Coral
      image: '/beneficio-2.webp',
      width: 1024,
      height: 1024
    },
    {
      title: 'Energía Limpia',
      desc: 'Disfruta de foco mental sostenido sin rebotes ni palpitaciones molestos.',
      bg: 'bg-[#DCD8F3]', // Soft Indigo/Lavander
      image: '/beneficio-3.webp',
      width: 1024,
      height: 666
    }
  ];

  return (
    <section id="beneficios" className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
      
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-extrabold text-curveAction/80 mb-2 font-display uppercase tracking-tight">
          La base de CURVE
        </h2>
        <p className="text-gray-500 font-medium text-sm max-w-xl mx-auto">
          Somos desarrolladores enfocados en crear fórmulas que de verdad hackean tu metabolismo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((item, idx) => (
          <div key={idx} className={`${item.bg} rounded-[2rem] pt-8 px-6 pb-0 relative overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl transition-all duration-300`}>
            
            {/* Top Right Arrow */}
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white backdrop-blur-md group-hover:bg-white group-hover:text-curveAction transition-colors z-10">
              <ArrowRight className="w-4 h-4" />
            </div>

            <h3 className="text-white text-3xl font-black mb-2 leading-tight pr-8 relative z-10">{item.title}</h3>
            <p className="text-white/90 text-sm mb-6 max-w-[90%] relative z-10">
              {item.desc}
            </p>

            {/* Visual Box with Image */}
            <div className="mt-auto relative w-full flex justify-center pb-0">
              <div className="w-[92%] h-56 rounded-t-[2rem] bg-white/30 backdrop-blur-md border-t border-x border-white/50 flex items-center justify-center overflow-hidden translate-y-0 group-hover:-translate-y-2 group-hover:h-60 transition-all duration-500 shadow-inner">
                <img
                  src={item.image}
                  alt={item.title}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </section>
  );
}
