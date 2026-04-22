import { Star } from 'lucide-react';

/**
 * Star rating compacto y accesible. Usado en el Hero para social proof
 * arriba del fold (impacto alto en conversión).
 */
export default function StarRating({
  rating = 4.8,
  count = 2000,
  size = 'md',
  showCount = true,
  className = '',
}) {
  const stars = 5;
  const filled = Math.round(rating);
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="img"
      aria-label={`${rating} de 5 estrellas basado en ${count}+ reseñas de clientes`}
    >
      <div className="flex" aria-hidden="true">
        {Array.from({ length: stars }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses} ${i < filled ? 'fill-curveAction text-curveAction' : 'text-gray-300'}`}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs md:text-sm font-semibold text-gray-600">
          <strong className="text-textPrimary">{rating.toFixed(1)}</strong>
          <span className="text-gray-400"> · +{count.toLocaleString('es-CO').replace(/,/g, '.')} clientas</span>
        </span>
      )}
    </div>
  );
}
