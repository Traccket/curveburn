import { useState, useEffect } from 'react';
import { Share2, Link as LinkIcon, ArrowLeft, ArrowUpRight, CheckCircle2, ArrowRight } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    tag: "Ciencia Metabólica",
    title: "¿Por qué tu metabolismo se estancó? La verdad del Cortisol.",
    excerpt: "Entiende qué es la tumba metabólica y cómo tus hormonas del estrés están bloqueando la quema de abdomen de forma silenciosa...",
    image: "/blog-1.png",
    readTime: "4 MIN"
  },
  {
    id: 2,
    tag: "Salud Real",
    title: "El mito de comer menos: Por qué las dietas extremas te engordan.",
    excerpt: "Las calorías no son matemáticas perfectas. Restringirte sin control daña tu termogénesis celular, descubre lo que la ciencia dice hoy.",
    image: "/blog-2.png",
    readTime: "3 MIN"
  },
  {
    id: 3,
    tag: "Fisiología Oculta",
    title: "Termogénesis 101: Cómo obligar a tu cuerpo a usar grasa.",
    excerpt: "No tienes que correr dos horas al día. Hay procesos bioquímicos que pueden activarse de forma natural para crear un efecto caldera...",
    image: "/blog-3.png",
    readTime: "5 MIN"
  },
  {
    id: 4,
    tag: "Neuro-Nutrición",
    title: "Antojos nocturnos: El ciclo del azúcar y cómo apagarlo de raíz.",
    excerpt: "Tus visitas a la nevera a las 10 PM no son falta de voluntad, son picos de glicemia y caídas de dopamina que deben hackearse inteligentemente.",
    image: "/blog-4.png",
    readTime: "3 MIN"
  }
];

export default function BlogSection() {
  const [selectedPostId, setSelectedPostId] = useState(null);
  
  // Quick hack: getting full post data depending on selection
  const selectedPost = BLOG_POSTS.find(p => p.id === selectedPostId);

  return (
    <section id="blog" className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-gray-100">
      
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <span className="text-curveAction font-bold text-sm tracking-widest uppercase mb-2 block">
            Laboratorio Educativo
          </span>
          <h2 className="text-4xl md:text-[3.5rem] font-display font-black text-textPrimary leading-none mb-6">
            Blog & <span className="text-gradient">Ciencia.</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Un espacio puro diseñado para aprender, entender tu biología femenina y cuidarte desde la raíz. Información médica simplificada sin tabúes para hackear tu metabolismo.
          </p>
        </div>
      </div>

      {/* ASYMMETRIC BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Featured Large Card (Item 1) */}
        <div 
          onClick={() => setSelectedPostId(1)}
          className="col-span-1 md:col-span-2 row-span-2 group cursor-pointer rounded-3xl overflow-hidden glassmorphism flex flex-col md:flex-row hover:shadow-premium-hover transition-all duration-500 border border-white/40"
        >
          <div className="md:w-1/2 relative overflow-hidden h-64 md:h-auto">
            <div className="absolute inset-0 bg-curveDark/20 z-10 group-hover:bg-transparent transition-all duration-500"></div>
            <img 
              src={BLOG_POSTS[0].image} 
              alt={BLOG_POSTS[0].title}
              className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <span className="bg-white/90 backdrop-blur text-curveAction text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {BLOG_POSTS[0].tag}
              </span>
            </div>
          </div>
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
             <div className="flex items-center text-xs text-gray-400 font-bold mb-4 gap-2">
                <span className="w-2 h-2 rounded-full bg-curveAction"></span> 
                LECTURA • {BLOG_POSTS[0].readTime}
             </div>
             <h3 className="text-2xl md:text-3xl font-display font-black text-gray-900 leading-tight mb-4 group-hover:text-curveAction transition-colors">
               {BLOG_POSTS[0].title}
             </h3>
             <p className="text-gray-500 mb-8 line-clamp-3 leading-relaxed">
               {BLOG_POSTS[0].excerpt}
             </p>
             <div className="flex items-center gap-2 text-curveAction font-bold justify-end w-full group-hover:translate-x-2 transition-transform">
               Ver Nota Completa <ArrowUpRight className="w-5 h-5" />
             </div>
          </div>
        </div>

        {/* Small Card (Item 2) */}
        <div 
          onClick={() => setSelectedPostId(2)}
          className="group cursor-pointer rounded-3xl overflow-hidden glassmorphism flex flex-col hover:shadow-premium transition-all duration-500 border border-white/40"
        >
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-curveDark/20 z-10 group-hover:bg-transparent transition-all duration-500"></div>
            <img 
              src={BLOG_POSTS[1].image} 
              alt={BLOG_POSTS[1].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between bg-white/50">
            <div>
              <span className="text-curveAction text-xs font-bold uppercase tracking-wider mb-2 block">{BLOG_POSTS[1].tag}</span>
              <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-curveAction transition-colors">
                {BLOG_POSTS[1].title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2">{BLOG_POSTS[1].excerpt}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mt-6 group-hover:bg-curveAction group-hover:text-white text-gray-400 transition-all border border-gray-100 shadow-sm ml-auto">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Small Card (Item 3) */}
        <div 
          onClick={() => setSelectedPostId(3)}
          className="group cursor-pointer rounded-3xl overflow-hidden glassmorphism flex flex-col hover:shadow-premium transition-all duration-500 border border-white/40"
        >
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-curveDark/20 z-10 group-hover:bg-transparent transition-all duration-500"></div>
            <img 
              src={BLOG_POSTS[2].image} 
              alt={BLOG_POSTS[2].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between bg-white/50">
            <div>
              <span className="text-curveAction text-xs font-bold uppercase tracking-wider mb-2 block">{BLOG_POSTS[2].tag}</span>
              <h3 className="text-lg font-black text-gray-900 leading-tight mb-2 group-hover:text-curveAction transition-colors">
                {BLOG_POSTS[2].title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2">{BLOG_POSTS[2].excerpt}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mt-6 group-hover:bg-curveAction group-hover:text-white text-gray-400 transition-all border border-gray-100 shadow-sm ml-auto">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Horizontal Medium Card (Item 4) */}
        <div 
          onClick={() => setSelectedPostId(4)}
          className="col-span-1 md:col-span-2 group cursor-pointer rounded-3xl overflow-hidden glassmorphism flex flex-col sm:flex-row hover:shadow-premium transition-all duration-500 border border-white/40"
        >
          <div className="sm:w-2/5 relative h-48 sm:h-auto overflow-hidden">
             <div className="absolute inset-0 bg-curveDark/20 z-10 group-hover:bg-transparent transition-all duration-500"></div>
             <img 
              src={BLOG_POSTS[3].image} 
              alt={BLOG_POSTS[3].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          </div>
          <div className="sm:w-3/5 p-6 flex flex-col justify-center bg-white/50">
             <span className="text-curveAction text-xs font-bold uppercase tracking-wider mb-2 block">{BLOG_POSTS[3].tag}</span>
             <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 group-hover:text-curveAction transition-colors">
                {BLOG_POSTS[3].title}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{BLOG_POSTS[3].excerpt}</p>
              <div className="font-bold text-xs text-gray-400 mt-auto uppercase tracking-widest flex items-center gap-2">
                Leer Artículo <ArrowUpRight className="w-4 h-4 translate-y-[-1px]" />
              </div>
          </div>
        </div>

      </div>

      <ArticleModal post={selectedPost} onClose={() => setSelectedPostId(null)} />
    </section>
  );
}


/* MODAL COMPONENT (Isolated for readability, placed here for architectural simplicity) */
function ArticleModal({ post, onClose }) {
  // Prevent scroll when open
  useEffect(() => {
    if (post) {document.body.style.overflow = 'hidden';} 
    else {document.body.style.overflow = 'auto';}
    return () => { document.body.style.overflow = 'auto'; };
  }, [post]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-6 bg-white/80 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Background layer click to close */}
      <div className="absolute inset-0 z-0" onClick={onClose}></div>

      {/* Main Full-Screen-like Modal Panel */}
      <div className="relative w-full h-[95vh] sm:h-[90vh] max-w-4xl bg-white sm:rounded-[3rem] shadow-premium overflow-hidden z-10 flex flex-col border border-gray-100 translate-y-0 sm:translate-y-4 animate-in slide-in-from-bottom-24 sm:slide-in-from-bottom-8 duration-500">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 px-6 md:px-10 border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-20">
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 text-gray-400 hover:text-textPrimary font-bold text-sm tracking-wider uppercase transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Regresar
          </button>
          
          <div className="flex items-center gap-4">
             <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 transition-colors">
               <LinkIcon className="w-4 h-4" />
             </button>
             <a href="#comprar" onClick={onClose} className="px-6 py-2.5 bg-curveAction text-white font-bold text-sm rounded-full hover:brightness-110 transition-all shadow-md">
               Comprar Curso
             </a>
          </div>
        </div>

        {/* Article Scroller */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          
          {/* Header Image */}
          <div className="w-full h-64 md:h-[400px] relative">
            <img src={post.image} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
          </div>

          {/* Article Body */}
          <div className="max-w-2xl mx-auto px-6 pb-24 -mt-32 md:-mt-48 relative z-10">
            
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-premium border border-gray-50 mb-12">
               <span className="text-curveAction font-bold text-xs tracking-widest uppercase mb-4 block">
                 {post.tag} • {post.readTime}
               </span>
               <h1 className="text-3xl md:text-5xl font-display font-black text-gray-900 leading-[1.1] mb-6">
                 {post.title}
               </h1>
               
               <div className="w-full h-px bg-gray-100 my-8"></div>
               
               {/* DYNAMIC ARTICLE CONTENT RENDER */}
               <div className="prose prose-lg prose-pink prose-headings:font-display prose-headings:font-black text-gray-600">
                  <ArticleContent id={post.id} />
               </div>
            </div>

            {/* Sales Injector Box (Bottom of Article) */}
            <div className="bg-curveDark rounded-[2rem] p-8 text-center text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200%] bg-curve-dark-gradient animate-spin-slow opacity-50 z-0"></div>
               <div className="relative z-10">
                 <h3 className="text-2xl font-display font-black mb-3">La ciencia ya hizo el trabajo por ti.</h3>
                 <p className="text-gray-300 text-sm mb-6 max-w-sm mx-auto">En lugar de pelear con tu metabolismo, usa los agentes termogénicos de alta calidad contenidos en <strong>CURVE</strong> para poner a la biología de tu lado hoy mismo.</p>
                 <a href="#comprar" onClick={onClose} className="inline-flex items-center justify-center gap-2 bg-curveAction text-white px-8 py-4 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(209,122,171,0.4)]">
                   Empezar mi Protocolo Curve Hoy <ArrowRight className="w-5 h-5" />
                 </a>
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

function ArticleContent({ id }) {
  if (id === 1) {
    return (
      <>
        <p className="mb-5 text-xl font-medium leading-relaxed text-gray-800">Para entender por qué las dietas extremas dejan de funcionar, debemos dejar de culpar a las calorías y empezar a observar nuestras hormonas, especialmente a nuestro enemigo silencioso: el <strong>cortisol</strong>.</p>
        <h3 className="text-2xl font-bold mt-8 mb-4">El Ciclo de la Supervivencia Celular</h3>
        <p className="mb-4">Cuando reduces agresivamente tu consumo de alimentos o vives bajo estrés constante diario, tu cuerpo no piensa <em>"oh genial, es hora de usar grasa de las caderas para vernos mejor"</em>. Biológicamente, tu cerebro primitivo recibe la alerta: <strong>"Estamos en época de escasez y peligro mortal"</strong>.</p>
        <p className="mb-4">El resultado directo es un pico constante de la hormona cortisol en sangre. El cortisol instruye a tu cuerpo a detener drásticamente la quema calórica, ralentizar la tiroides y aferrarse a cada gramo de grasa visceral (generalmente en el abdomen bajo) como un mecanismo de pura supervivencia evolutiva.</p>
        
        <div className="bg-curvePink/10 p-6 rounded-2xl my-8 border border-curvePink/20">
          <h4 className="font-bold text-curveAction mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> ¿Cómo romper este escudo de cortisol?</h4>
          <p className="text-sm">La clave médica <strong>no es comer menos</strong>, es apagar bioquímicamente las señales de alerta celular. Los ingredientes termogénicos de alta calidad contenidos en el <strong className="text-gray-900">Método CURVE</strong> están científicamente extraídos para reducir la inflamación sistémica natural corporativa, permitiendo que tu cuerpo vuelva a sentirse "seguro" para liberar esos depósitos de grasa oxidada al torrente sanguíneo y usarlos como energía diaria pura.</p>
        </div>
      </>
    );
  }

  if (id === 2) {
    return (
      <>
        <p className="mb-5 text-xl font-medium leading-relaxed text-gray-800">Nos han mentido durante décadas en revistas de moda: "Come menos, muévete más". Suena matemáticamente perfecto, ¿verdad? Lamentablemente, tu cuerpo no es una calculadora de suma y resta, <strong>es un laboratorio químico muy avanzado</strong>.</p>
        <h3 className="text-2xl font-bold mt-8 mb-4">El oscuro efecto "Tumba Metabólica"</h3>
        <p className="mb-4">Cuando te sometes a dietas restrictivas extremas de moda (jugos detox mágicos, cero carbohidratos netos, ayunos prolongados sin preparación médica), tu metabolismo basal hace una adaptación milagrosa de ahorro. Si solías gastarle 2,000 calorías, aprenderá a sobrevivir respirando solo con 800.</p>
        <p className="mb-4">¿Qué pasa la temida semana que vuelves a comer normal? Al cuerpo tener su tasa bajísima, <strong>todo lo extra se almacenará directamente como tejido adiposo (grasa)</strong> por terror a una nueva escasez. Este daño metabólico, conocido coloquialmente como "efecto rebote masivo", puede durar años si no se hace una reversión metabólica sana.</p>
        
        <div className="bg-curvePink/10 p-6 rounded-2xl my-8 border border-curvePink/20">
          <h4 className="font-bold text-curveAction mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Cambiando el Paradigma con CURVE</h4>
          <p className="text-sm">Para sanar un metabolismo crónicamente dañado necesitas agentes termogénicos estables que eleven tu gasto basal pasivo sin causarte taquicardia o picos de ansiedad. La fórmula patentada de <strong className="text-gray-900">CURVE</strong> funciona obligando al cuerpo a encender su propia caldera interna suavemente a lo largo del mes, para que vuelvas a un estado de homeostasis metabólica y quemes calorías incluso estando sentada en frente de tu computador.</p>
        </div>
      </>
    );
  }

  if (id === 3) {
    return (
      <>
        <p className="mb-5 text-xl font-medium leading-relaxed text-gray-800">La palabra "termogénesis" suena a ciencia ficción compleja, pero es literalmente <strong>el proceso biológico más importante</strong> a nivel mundial si tu objetivo final es conseguir resultados corporales a largo plazo de forma armónica.</p>
        <h3 className="text-2xl font-bold mt-8 mb-4">Transformando tu cuerpo en una "caldera"</h3>
        <p className="mb-4">La termogénesis es simplemente la producción de calor basal en el cuerpo a nivel celular. Para que tu cuerpo pueda elevar incluso décimas su temperatura, debe gastar forzosamente energía calórica. Y adivina de dónde saca esa energía si los canales fisiológicos correctos están activos: de tus adipocitos (depósitos de grasa blanca estancada).</p>
        <p className="mb-4">El problema de la época moderna es que, de forma natural, este proceso natural está extremadamente dormido en la mayoría de mujeres mayores de 25 años debido al estrés ambiental y la genética.</p>
        
        <div className="bg-curvePink/10 p-6 rounded-2xl my-8 border border-curvePink/20">
          <h4 className="font-bold text-curveAction mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Aceleración Inducida Naturalmente</h4>
          <p className="text-sm">No tienes que obligarte a pasar castigadoramente 2 horas corriendo en la caminadora odiando el proceso para activar este efecto biológico. Los compuestos bioactivos limpios en <strong className="text-gray-900">CURVE</strong> funcionan como una chispa en madera seca. Al consumirlo diariamente, eleva sutilmente tu temperatura interna central, convirtiendo tus depósitos adiposos solidos de caderas, vientre y brazos en "combustible líquido" natural para tu cerebro durante el día.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="mb-5 text-xl font-medium leading-relaxed text-gray-800">Son las 9:00 PM de la noche. Estás viendo tu serie favorita arropada y de repente surge una necesidad biológica desesperada e incontrolable por chocolate, pan crujiente o azúcar. Tu mente racional sabe el por qué no, pero tu biología está gritando.</p>
      <h3 className="text-2xl font-bold mt-8 mb-4">La devastadora montaña rusa de la insulina</h3>
      <p className="mb-4">Los antojos nocturnos rara vez son causados por tu "falta de disciplina personal". Casi siempre, esto suele originarse horas y meses atrás por un desarreglo del índice glucémico sistémico. Cuando comes azúcares disfrazados escondidos durante el día, tu cuerpo satura tu hígado y libera toneladas de insulina como camiones de bomberos para bajar el azúcar en la sangre de emergencia.</p>
      <p className="mb-4">Esta bajada ultra agresiva luego causa algo llamado "hipoglucemia reactiva": una alerta silenciosa en la base de tu cerebro exigiendo glucosa de forma dolorosamente inmediata. Y debido a que a esa hora tu nivel de dopamina baja, todo termina explotando en atracones, boicoteando meses de progreso en una sola noche.</p>
      
      <div className="bg-curvePink/10 p-6 rounded-2xl my-8 border border-curvePink/20">
        <h4 className="font-bold text-curveAction mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Supresores Botánicos Naturales</h4>
        <p className="text-sm">Evitar apostar de nuevo todas tus fichas a tu simple "fuerza de voluntad humana" es el mejor método científico. <strong className="text-gray-900">El Método CURVE</strong> incluye estabilizadores potentes y limpios de la glucosa que actúan a nivel hormonal. Tomándolo disciplinadamente mantendrás tus rangos en sangre perfectamente planos, logrando apagar las luces al "monstruo del azúcar nocturno", garantizando control mental sin sufrir.</p>
      </div>
    </>
  );
}
