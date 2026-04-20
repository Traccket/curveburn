export default function LogosSection() {
  const logos = [
    { name: 'Forbes', subtitle: '"El quemador #1 de Latam"', font: 'font-serif text-3xl font-bold tracking-tighter' },
    { name: 'THE OPRAH MAGAZINE', subtitle: '"Resultados Comprobados"', font: 'font-serif text-xl tracking-widest' },
    { name: 'VOGUE', subtitle: '"Pioneros en reducción"', font: 'font-serif text-3xl tracking-widest' },
    { name: 'FORTUNE', subtitle: '"Mejor suplemento para mujeres"', font: 'font-serif text-2xl font-black' },
  ];

  return (
    <section className="py-12 bg-white/40 border-y border-white/50 backdrop-blur-sm relative z-20">
      <div className="max-w-7xl mx-auto px-6 overflow-hidden">
        <div className="flex flex-wrap md:flex-nowrap justify-center lg:justify-between items-center gap-10 opacity-70">
          {logos.map((logo, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center px-4 w-1/2 md:w-auto">
              <span className={`text-gray-800 ${logo.font}`}>{logo.name}</span>
              <span className="text-xs text-gray-500 font-medium mt-2 max-w-[120px]">{logo.subtitle}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
