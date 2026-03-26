'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { CanvasElement as CanvasElementType } from '@/lib/studio/types';

type CanvasElementProps = {
  element: CanvasElementType;
  selected: boolean;
  scale: number;
  onSelect: () => void;
  onUpdate: (patch: Partial<CanvasElementType>) => void;
};

export function CanvasElement({ element, selected, scale, onSelect, onUpdate }: CanvasElementProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeState = useRef<{ startX: number; startY: number; origW: number; origH: number; corner: string } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (editing) return;
      e.stopPropagation();
      onSelect();

      const target = e.target as HTMLElement;
      if (target.dataset.handle) {
        resizeState.current = {
          startX: e.clientX,
          startY: e.clientY,
          origW: element.width,
          origH: element.height,
          corner: target.dataset.handle,
        };
      } else {
        dragState.current = {
          startX: e.clientX,
          startY: e.clientY,
          origX: element.x,
          origY: element.y,
        };
      }

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [editing, element.x, element.y, element.width, element.height, onSelect],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragState.current) {
        const dx = (e.clientX - dragState.current.startX) / scale;
        const dy = (e.clientY - dragState.current.startY) / scale;
        onUpdate({ x: Math.round(dragState.current.origX + dx), y: Math.round(dragState.current.origY + dy) });
      }
      if (resizeState.current) {
        const dx = (e.clientX - resizeState.current.startX) / scale;
        const dy = (e.clientY - resizeState.current.startY) / scale;
        const { corner, origW, origH } = resizeState.current;

        let newW = origW;
        let newH = origH;
        if (corner.includes('e')) newW = Math.max(20, origW + dx);
        if (corner.includes('w')) newW = Math.max(20, origW - dx);
        if (corner.includes('s')) newH = Math.max(20, origH + dy);
        if (corner.includes('n')) newH = Math.max(20, origH - dy);

        const patch: Partial<CanvasElementType> = {
          width: Math.round(newW),
          height: Math.round(newH),
        };

        if (corner.includes('w')) {
          patch.x = Math.round(element.x + (origW - newW));
        }
        if (corner.includes('n')) {
          patch.y = Math.round(element.y + (origH - newH));
        }

        onUpdate(patch);
      }
    },
    [scale, element.x, element.y, onUpdate],
  );

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
    resizeState.current = null;
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (element.type === 'text') {
      setEditing(true);
    }
  }, [element.type]);

  useEffect(() => {
    if (editing && elRef.current) {
      const textEl = elRef.current.querySelector<HTMLElement>('[contenteditable]');
      textEl?.focus();
    }
  }, [editing]);

  const handleBlur = useCallback(() => {
    if (!editing) return;
    setEditing(false);
    if (elRef.current) {
      const textEl = elRef.current.querySelector<HTMLElement>('[contenteditable]');
      if (textEl) onUpdate({ content: textEl.innerText });
    }
  }, [editing, onUpdate]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.style.opacity ?? 1,
    cursor: editing ? 'text' : 'move',
  };

  const renderContent = () => {
    const { type, style: s } = element;

    if (type === 'text') {
      return (
        <div
          contentEditable={editing}
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditing(false);
              (e.target as HTMLElement).blur();
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            color: s.fill ?? '#000',
            fontSize: s.fontSize ?? 24,
            fontWeight: s.fontWeight ?? 400,
            fontFamily: s.fontFamily ?? 'system-ui',
            textAlign: s.textAlign ?? 'left',
            lineHeight: s.lineHeight ?? 1.3,
            outline: 'none',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {element.content}
        </div>
      );
    }

    if (type === 'image') {
      return (
        <img
          src={element.src ?? 'https://placehold.co/400x300/e2e8f0/94a3b8?text=Image'}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: s.objectFit ?? 'cover',
            borderRadius: s.borderRadius ?? 0,
            display: 'block',
          }}
        />
      );
    }

    if (type === 'shape') {
      const shapeStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        background: s.fill ?? '#3b82f6',
        borderRadius: element.shape === 'circle' ? '50%' : (s.borderRadius ?? 0),
        border: s.stroke ? `${s.strokeWidth ?? 2}px solid ${s.stroke}` : undefined,
      };
      return <div style={shapeStyle} />;
    }

    return null;
  };

  const handles = ['nw', 'ne', 'sw', 'se'] as const;

  return (
    <div
      ref={elRef}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'group touch-none select-none',
        selected && 'ring-2 ring-blue-500 ring-offset-0',
      )}
    >
      {renderContent()}

      {selected && !editing && handles.map((corner) => (
        <div
          key={corner}
          data-handle={corner}
          className="absolute z-50 size-2.5 rounded-full border-2 border-blue-500 bg-white"
          style={{
            top: corner.includes('n') ? -5 : undefined,
            bottom: corner.includes('s') ? -5 : undefined,
            left: corner.includes('w') ? -5 : undefined,
            right: corner.includes('e') ? -5 : undefined,
            cursor:
              corner === 'nw' || corner === 'se'
                ? 'nwse-resize'
                : 'nesw-resize',
          }}
        />
      ))}
    </div>
  );
}
