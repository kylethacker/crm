'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { CanvasElement as CanvasElementType, Design } from '@/lib/studio/types';
import { CanvasElement } from './canvas-element';

type DesignCanvasProps = {
  design: Design;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, patch: Partial<CanvasElementType>) => void;
};

export function DesignCanvas({ design, selectedId, onSelect, onUpdateElement }: DesignCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const recalc = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const padding = 48;
    const scaleX = (rect.width - padding) / design.width;
    const scaleY = (rect.height - padding) / design.height;
    setScale(Math.min(scaleX, scaleY, 1));
  }, [design.width, design.height]);

  useEffect(() => {
    recalc();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalc]);

  const handleBackgroundClick = useCallback(() => {
    onSelect(null);
  }, [onSelect]);

  return (
    <div
      ref={containerRef}
      className="flex flex-1 items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-900"
    >
      <div
        style={{
          width: design.width,
          height: design.height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          background: design.background || '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
        onPointerDown={handleBackgroundClick}
      >
        {design.elements
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => (
            <CanvasElement
              key={el.id}
              element={el}
              selected={el.id === selectedId}
              scale={scale}
              onSelect={() => onSelect(el.id)}
              onUpdate={(patch) => onUpdateElement(el.id, patch)}
            />
          ))}
      </div>
    </div>
  );
}
