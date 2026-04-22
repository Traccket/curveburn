import { ShieldCheck } from 'lucide-react';

/**
 * Badge de garantía 30 días. Reduce fricción psicológica de primera compra.
 */
export default function GuaranteeBadge({ className = '' }) {
  return (
    <div
      className={`inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-full px-3 py-1.5 text-xs font-semibold ${className}`}
      role="note"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
      <span>Garantía de satisfacción 30 días</span>
    </div>
  );
}
