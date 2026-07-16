import { useState, useEffect, useRef } from 'react';
import { SHOPIFY_CONFIG } from '../lib/shopify';
import { beginCheckout } from '../lib/localCheckout';
import { trackLead, trackCTA } from '../lib/analytics';
import { QUIZ_DISCOUNT_CODE } from '../config/business';
import { useModal } from '../hooks/useModal';
import {
  X, Sparkles, ChevronRight, Flame, Battery, Apple, Scale,
  Activity, PersonStanding, Bed, Zap, Cookie, AlertCircle, TrendingDown,
  Coffee, Moon, Cloud, HeartPulse, Timer, Sun, Clock
} from 'lucide-react';

function getDiagnosticResult(answers) {
  const { goal, obstacle, age, digestion } = answers;

  // Profile 1: The Anxious Craver (Sugar addiction, anxiety)
  if (obstacle === 'hambre' || goal === 'antojos') {
    return {
      title: 'Resistencia Metabólica por Ansiedad ⚠️',
      description: (
        <>
          Hemos detectado el problema: Tus intentos fallan porque tus{' '}
          <strong>picos de cortisol y glucosa</strong> te generan una ansiedad por comer
          incontrolable. ¡Tu fuerza de voluntad no tiene la culpa!
          <br />
          <br />
          <strong>EL MÉTODO CURVE</strong> es tu solución perfecta porque contiene supresores
          neuro-metabólicos que <strong>apagarán el hambre nerviosa de inmediato</strong>,
          obligando a tu cuerpo a usar tu propia grasa abdominal para obtener la energía que te
          falta.
        </>
      ),
    };
  }

  // Profile 2: The Blocked / Slow Metabolism (Age, digestion, stalled)
  if (obstacle === 'estancado' || age === 'mature' || age === 'senior' || digestion === 'lenta' || digestion === 'hinchada') {
    return {
      title: 'Estancamiento Hormonal y Digestivo 🛑',
      description: (
        <>
          El diagnóstico es claro: Tu <strong>metabolismo basal está literalmente dormido</strong>.
          Por tu edad y síntomas inflamatorios, comer menos ya no te hará bajar de peso. Necesitas
          un choque termogénico celular.
          <br />
          <br />
          <strong>EL MÉTODO CURVE</strong> reactivará de forma agresiva (pero 100% segura) la quema
          natural de calorías, destrozando la grasa celular estancada que ninguna dieta ha podido
          penetrar.
        </>
      ),
    };
  }

  // Profile 3: The Exhausted Plateau (General lack of energy, default fallback)
  return {
    title: 'Fatiga Celular y Resistencia Focalizada 🔋',
    description: (
      <>
        Haces el esfuerzo, pero tu cuerpo ha creado una{' '}
        <strong>armadura que bloquea la pérdida de peso</strong> por falta de energía metabólica.
        En lugar de quemar grasa, tu cuerpo la está acaparando.
        <br />
        <br />
        Cero excusas: <strong>EL MÉTODO CURVE</strong> romperá esa barrera adaptativa dándote horas
        de energía ultra-limpia mientras transforma tus células grasas en tu fuente principal de
        combustible.
      </>
    ),
  };
}

export default function QuizModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0); // 0 = Intro, 1-6 = Qs, 7 = Analyzing, 8 = Result
  
  // Progress calculations
  const totalSteps = 6;
  const progressPercent = step === 0 ? 0 : step <= totalSteps ? (step / totalSteps) * 100 : 100;

  // Answers State
  const [answers, setAnswers] = useState({
    goal: '',
    activity: '',
    obstacle: '',
    digestion: '',
    age: '',
    sleep: ''
  });

  // Reset quiz when opened
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAnswers({ goal: '', activity: '', obstacle: '', digestion: '', age: '', sleep: '' });
    }
  }, [isOpen]);

  // Scroll lock + Escape + focus trap compartidos entre todos los modales
  const { containerRef } = useModal(isOpen, onClose);

  // Timer de transición entre preguntas y de la animación de "análisis".
  // Se cancela en unmount / nuevo click para evitar setState sobre
  // componentes desmontados.
  const advanceTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
    };
  }, []);

  const handleSelectAnswer = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      if (step < 6) {
        setStep(step + 1);
      } else {
        startAnalyzing();
      }
    }, 400);
  };

  const startAnalyzing = () => {
    setStep(7);
    // Quiz completado → registrar como Lead (alto valor para audiencias de Meta)
    trackLead({ source: 'quiz_completed', value: 0 });
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      setStep(8);
    }, 3000); // 3 seconds analysis animation
  };

  const proceedToCheckout = () => {
    // Usamos la variante de SUSCRIPCIÓN (más popular + mejor AOV) cuando esté
    // habilitada. Si SUBSCRIPTIONS_ENABLED es false (Wompi pendiente), fallback
    // a compra única para no enviar al cliente a un checkout sin métodos de pago.
    trackCTA('quiz_checkout');
    const variantId = SHOPIFY_CONFIG.SUBSCRIPTIONS_ENABLED
      ? SHOPIFY_CONFIG.VARIANTS.PLAN_2_MONTHS.id
      : SHOPIFY_CONFIG.VARIANTS.ONE_TIME.id;
    beginCheckout(variantId, 1, {
      // Para la ruta Shopify: código de descuento en la URL del checkout.
      discount: QUIZ_DISCOUNT_CODE,
      // Para la ruta contra-entrega (Sendura): el 5% se aplica en el servidor.
      quizDiscount: true,
      utmSource: 'quiz',
      utmMedium: 'onsite',
      utmCampaign: 'diagnostic',
    });
    // Cerramos el quiz para que el modal de checkout quede al frente sin
    // dos focus-traps compitiendo por el teclado.
    onClose();
  };

  const diagnosticResult = getDiagnosticResult(answers);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-white/40 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Test de diagnóstico metabólico"
    >

      {/* Background dark gradient to pop the white modal */}
      <div className="absolute inset-0 bg-curveDark/30" onClick={onClose} aria-hidden="true"></div>

      {/* Main Box */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-premium overflow-hidden border border-white/50 z-10 flex flex-col max-h-[90vh]"
      >

        {/* Header - Progress / Close */}
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="flex-1 mr-8 relative">
            {step > 0 && step < 8 && (
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-curveAction h-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            )}
            {step > 0 && step < 8 && (
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2 text-right">
                {Math.round(progressPercent)}% COMPLETADO
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar test"
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-2 custom-scrollbar">

          {/* STEP 0: INTRO */}
          {step === 0 && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-curvePink/10 rounded-full mb-6">
                 <Sparkles className="w-8 h-8 text-curveAction" />
              </div>
              <span className="inline-block px-4 py-1.5 bg-green-50 text-green-600 text-xs font-black uppercase tracking-widest rounded-full mb-4">
                Diagnóstico Gratuito
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-black text-textPrimary leading-tight mb-4">
                Descubre qué necesita tu <span className="text-curveAction">cuerpo</span>
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto text-base">
                Responde 6 simples preguntas y te ayudaremos a identificar exactamente por qué tu metabolismo está lento y cómo CURVE puede ayudarte.
              </p>
              
              <div className="flex items-center justify-center gap-6 text-xs text-gray-400 font-medium mb-8">
                <span className="flex items-center gap-1.5"><Activity className="w-4 h-4"/> 2 Minutos</span>
                <span className="flex items-center gap-1.5"><PersonStanding className="w-4 h-4"/> 100% Personalizado</span>
              </div>

              <button 
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-10 py-4 bg-curveAction text-white rounded-full font-bold text-lg hover:brightness-110 shadow-lg hover:rotate-1 hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                Comenzar Mi Diagnóstico <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 1: GOAL */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <span className="text-curveAction font-bold text-sm mb-2 block">Pregunta 1</span>
              <h2 className="text-2xl md:text-3xl font-display font-black text-textPrimary mb-2">
                ¿Cuál es tu <span className="text-curveAction">principal objetivo</span> hoy?
              </h2>
              <p className="text-gray-500 mb-8 text-sm">Selecciona la razón principal por la que buscas ayuda.</p>
              
              <div className="space-y-3">
                <OptionCard 
                  icon={<Flame />} 
                  title="Quemar Grasa Rebelde" 
                  desc="Zonas difíciles como abdomen y caderas." 
                  onClick={() => handleSelectAnswer('goal', 'grasa')} 
                  active={answers.goal === 'grasa'}
                />
                <OptionCard 
                  icon={<Battery />} 
                  title="Falta de Energía" 
                  desc="Siento fatiga durante el día y me cuesta entrenar." 
                  onClick={() => handleSelectAnswer('goal', 'energia')} 
                  active={answers.goal === 'energia'}
                />
                <OptionCard 
                  icon={<Cookie />} 
                  title="Controlar Antojos" 
                  desc="Ansiedad constante por comer dulces o pan." 
                  onClick={() => handleSelectAnswer('goal', 'antojos')} 
                  active={answers.goal === 'antojos'}
                />
                <OptionCard 
                  icon={<Scale />} 
                  title="Bajar de Peso General" 
                  desc="Quiero perder varios kilos y verme más delgada." 
                  onClick={() => handleSelectAnswer('goal', 'peso')} 
                  active={answers.goal === 'peso'}
                />
              </div>
            </div>
          )}

          {/* STEP 2: LIFESTYLE */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <span className="text-curveAction font-bold text-sm mb-2 block">Pregunta 2</span>
              <h2 className="text-2xl md:text-3xl font-display font-black text-textPrimary mb-2">
                ¿Cómo describirías tu <span className="text-curveAction">rutina diaria</span>?
              </h2>
              <p className="text-gray-500 mb-8 text-sm">Esto nos ayuda a entender tu velocidad metabólica actual.</p>
              
              <div className="space-y-3">
                <OptionCard 
                  icon={<Zap />} 
                  title="Muy Activa" 
                  desc="Entreno casi todos los días o tengo un trabajo físico." 
                  onClick={() => handleSelectAnswer('activity', 'alta')} 
                  active={answers.activity === 'alta'}
                />
                <OptionCard 
                  icon={<Activity />} 
                  title="Actividad Moderada" 
                  desc="Hago ejercicio 2 a 3 veces por semana." 
                  onClick={() => handleSelectAnswer('activity', 'media')} 
                  active={answers.activity === 'media'}
                />
                <OptionCard 
                  icon={<Bed />} 
                  title="Sedentaria / Poco Tiempo" 
                  desc="Paso mucho tiempo sentada y casi no entreno." 
                  onClick={() => handleSelectAnswer('activity', 'baja')} 
                  active={answers.activity === 'baja'}
                />
              </div>
            </div>
          )}

          {/* STEP 3: OBSTACLES */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <span className="text-curveAction font-bold text-sm mb-2 block">Pregunta 3</span>
              <h2 className="text-2xl md:text-3xl font-display font-black text-textPrimary mb-2">
                ¿Cuál es tu <span className="text-curveAction">mayor obstáculo</span> para perder peso?
              </h2>
              <p className="text-gray-500 mb-8 text-sm">Sé honesta, es muy común pasar por esto.</p>
              
              <div className="space-y-3">
                <OptionCard 
                  icon={<TrendingDown />} 
                  title="Metabolismo Estancado" 
                  desc="Hago dietas pero ya no bajo de peso." 
                  onClick={() => handleSelectAnswer('obstacle', 'estancado')} 
                  active={answers.obstacle === 'estancado'}
                />
                <OptionCard 
                  icon={<Apple />} 
                  title="Adicción a la Comida" 
                  desc="Pico entre comidas y me cuesta controlarme." 
                  onClick={() => handleSelectAnswer('obstacle', 'hambre')} 
                  active={answers.obstacle === 'hambre'}
                />
                <OptionCard 
                  icon={<AlertCircle />} 
                  title="Falta de Constancia" 
                  desc="Empiezo bien pero luego lo dejo." 
                  onClick={() => handleSelectAnswer('obstacle', 'constancia')} 
                  active={answers.obstacle === 'constancia'}
                />
              </div>
            </div>
          )}

          {/* STEP 4: DIGESTION */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <span className="text-curveAction font-bold text-sm mb-2 block">Pregunta 4</span>
              <h2 className="text-2xl md:text-3xl font-display font-black text-textPrimary mb-2">
                ¿Cómo describirías tu <span className="text-curveAction">digestión</span>?
              </h2>
              <p className="text-gray-500 mb-8 text-sm">La inflamación está ligada a un metabolismo estancado.</p>
              
              <div className="space-y-3">
                <OptionCard 
                  icon={<Cloud />} 
                  title="Mucha sensación de inflamación" 
                  desc="Me siento hinchada incluso comiendo poco." 
                  onClick={() => handleSelectAnswer('digestion', 'hinchada')} 
                  active={answers.digestion === 'hinchada'}
                />
                <OptionCard 
                  icon={<Timer />} 
                  title="Digestión muy lenta o pesada" 
                  desc="Sufro de tránsito intestinal lento constantemente." 
                  onClick={() => handleSelectAnswer('digestion', 'lenta')} 
                  active={answers.digestion === 'lenta'}
                />
                <OptionCard 
                  icon={<HeartPulse />} 
                  title="Normal y balanceada" 
                  desc="Mi digestión es muy regular y saludable." 
                  onClick={() => handleSelectAnswer('digestion', 'normal')} 
                  active={answers.digestion === 'normal'}
                />
              </div>
            </div>
          )}

          {/* STEP 5: AGE */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <span className="text-curveAction font-bold text-sm mb-2 block">Pregunta 5</span>
              <h2 className="text-2xl md:text-3xl font-display font-black text-textPrimary mb-2">
                ¿En qué rango de <span className="text-curveAction">edad</span> te encuentras?
              </h2>
              <p className="text-gray-500 mb-8 text-sm">Esto ajusta la evaluación del impacto hormonal inicial.</p>
              
              <div className="space-y-3">
                <OptionCard 
                  icon={<PersonStanding />} 
                  title="18 - 25 años" 
                  desc="Metabolismo base en etapa de juventud." 
                  onClick={() => handleSelectAnswer('age', 'youth')} 
                  active={answers.age === 'youth'}
                />
                <OptionCard 
                  icon={<Activity />} 
                  title="26 - 35 años" 
                  desc="Inician leves cambios metabólicos." 
                  onClick={() => handleSelectAnswer('age', 'adult')} 
                  active={answers.age === 'adult'}
                />
                <OptionCard 
                  icon={<TrendingDown />} 
                  title="36 - 45 años" 
                  desc="El metabolismo se vuelve naturalmente más lento." 
                  onClick={() => handleSelectAnswer('age', 'mature')} 
                  active={answers.age === 'mature'}
                />
                <OptionCard 
                  icon={<Clock />} 
                  title="Más de 46 años" 
                  desc="Etapas pre-menopáusicas o menopáusicas influyen." 
                  onClick={() => handleSelectAnswer('age', 'senior')} 
                  active={answers.age === 'senior'}
                />
              </div>
            </div>
          )}

          {/* STEP 6: SLEEP */}
          {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <span className="text-curveAction font-bold text-sm mb-2 block">Pregunta 6</span>
              <h2 className="text-2xl md:text-3xl font-display font-black text-textPrimary mb-2">
                ¿Cómo calificas la <span className="text-curveAction">calidad de tu sueño</span>?
              </h2>
              <p className="text-gray-500 mb-8 text-sm">El descanso es clave en la quema y recuperación celular.</p>
              
              <div className="space-y-3">
                <OptionCard 
                  icon={<Moon />} 
                  title="Profundo y continuo" 
                  desc="Duermo de corrido y me levanto llena de energía." 
                  onClick={() => handleSelectAnswer('sleep', 'good')} 
                  active={answers.sleep === 'good'}
                />
                <OptionCard 
                  icon={<Coffee />} 
                  title="Superficial" 
                  desc="Me despierto muchas veces y me cuesta reacomodarme." 
                  onClick={() => handleSelectAnswer('sleep', 'light')} 
                  active={answers.sleep === 'light'}
                />
                <OptionCard 
                  icon={<Sun />} 
                  title="Insomnio frecuente" 
                  desc="Me cuesta conciliar el sueño y amanezco muy cansada." 
                  onClick={() => handleSelectAnswer('sleep', 'poor')} 
                  active={answers.sleep === 'poor'}
                />
              </div>
            </div>
          )}

          {/* STEP 7: ANALYZING */}
          {step === 7 && (
            <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in-95 duration-500">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-curveAction rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-curveAction animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Analizando tus respuestas...</h3>
              <p className="text-gray-500 text-sm text-center">Cruzando tus 6 parámetros corporales con nuestro modelo experto.</p>
            </div>
          )}

          {/* STEP 8: RESULTS */}
          {step === 8 && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-10 duration-700 pb-4">
              <span className="inline-block px-4 py-1.5 bg-green-50 text-green-600 text-xs font-black uppercase tracking-widest rounded-full mb-4">
                Diagnóstico Completado
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-black text-textPrimary leading-tight mb-4">
                {diagnosticResult.title}
              </h2>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                {diagnosticResult.description}
              </p>
              
              <div className="bg-curvePink/5 border border-curvePink/20 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-curvePink opacity-10 rounded-full blur-2xl"></div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-curveAction" /> Tu recompensa especial:
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Como premio por tomar acción y completar tu diagnóstico médico-nutricional, hemos activado un <strong>5% de descuento adicional</strong> válido por las próximas 2 horas.
                </p>
                <div className="bg-white border border-curveAction/30 py-3 px-4 rounded-xl flex justify-between items-center shadow-sm">
                  <span className="font-mono font-bold text-curveAction">{QUIZ_DISCOUNT_CODE}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">ACTIVADO</span>
                </div>
              </div>

              <button 
                onClick={proceedToCheckout}
                className="w-full bg-curveAction text-white font-black py-4 rounded-full shadow-premium hover:brightness-110 active:scale-[0.98] transition-all text-lg flex justify-center items-center gap-3 animate-pulse-slow"
              >
                Comprar mi Kit con 5% OFF <ChevronRight className="w-6 h-6" />
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Serás redirigida al checkout seguro de Shopify.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Helper component for options to keep it clean.
// Es un <button> real para que sea operable con teclado y lectores de pantalla.
function OptionCard({ icon, title, desc, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group w-full text-left cursor-pointer rounded-2xl border-2 transition-all p-4 md:p-5 flex items-start gap-4 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-curveAction ${
        active
          ? 'border-curveAction bg-curvePink/5 scale-[1.01]'
          : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className={`p-3 rounded-xl transition-colors ${
        active ? 'bg-curveAction text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
      }`}>
        {icon}
      </div>
      <div>
        <h3 className={`font-bold text-base md:text-lg transition-colors ${
          active ? 'text-curveAction' : 'text-gray-800 group-hover:text-black'
        }`}>{title}</h3>
        <p className="text-xs md:text-sm text-gray-500 mt-1 leading-snug">{desc}</p>
      </div>
    </button>
  );
}
