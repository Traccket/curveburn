import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento compartido de todos los modales de la landing:
 *  - Bloquea el scroll del body guardando/restaurando el valor previo
 *    (evita clobberar el estilo si hay dos modales encadenados).
 *  - Cierra con Escape.
 *  - Mueve el foco al abrir (initialFocusRef o el contenedor) y lo
 *    devuelve al elemento que lo tenía al cerrar.
 *  - Focus trap: Tab/Shift+Tab ciclan dentro del contenedor (WAI-ARIA dialog).
 *
 * Uso:
 *   const { containerRef, initialFocusRef } = useModal(isOpen, onClose);
 *   <div ref={containerRef} role="dialog" aria-modal="true">
 *     <button ref={initialFocusRef} onClick={onClose}>×</button>
 */
export function useModal(isOpen, onClose) {
  const containerRef = useRef(null);
  const initialFocusRef = useRef(null);

  // onClose vive en un ref para que el efecto no se re-ejecute cuando el
  // padre pasa una arrow function nueva en cada render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';

    // Deferred para no interferir con la animación de entrada
    const focusTimer = setTimeout(() => {
      (initialFocusRef.current || containerRef.current)?.focus?.();
    }, 50);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      if (e.key === 'Tab' && containerRef.current) {
        const nodes = containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [isOpen]);

  return { containerRef, initialFocusRef };
}
