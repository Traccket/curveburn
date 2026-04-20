import { Heart, FileText, CheckCircle } from 'lucide-react';

export default function MarqueeBanner() {
  const items = [
    { text: "AMAMOS Y CUIDAMOS NUESTRA COMUNIDAD", icon: Heart },
    { text: "INGREDIENTES CON INVESTIGACIÓN DETRÁS", icon: FileText },
    { text: "CALIDAD Y PUREZA GARANTIZADA", icon: CheckCircle },
  ];

  // Repeat items to fill standard screen
  const marqueeItems = [...items, ...items, ...items, ...items, ...items];

  return (
    <div className="bg-curveAction py-3 w-full overflow-hidden border-y border-white/20 select-none flex">
      {/* 
        Tailwind animated marquee.
        We render two identical blocks to loop seamlessly.
      */}
      <div className="flex shrink-0 animate-marquee whitespace-nowrap">
        {marqueeItems.map((Item, i) => (
          <div key={i} className="flex items-center gap-2 mx-8 text-white font-bold text-sm tracking-widest text-[0.8rem] uppercase">
            <Item.icon className="w-4 h-4 fill-white" />
            <span>{Item.text}</span>
          </div>
        ))}
      </div>
      <div className="flex shrink-0 animate-marquee whitespace-nowrap" aria-hidden="true">
        {marqueeItems.map((Item, i) => (
          <div key={i + 100} className="flex items-center gap-2 mx-8 text-white font-bold text-sm tracking-widest text-[0.8rem] uppercase">
            <Item.icon className="w-4 h-4 fill-white" />
            <span>{Item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
