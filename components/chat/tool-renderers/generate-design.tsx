import type { CanvasElement } from '@/lib/studio/types';

type DesignVariation = {
  id: string;
  name: string;
  background: string;
  elements: CanvasElement[];
  createdAt: string;
};

type DesignOutput = {
  variations: DesignVariation[];
};

function MiniElement({ el, scale }: { el: CanvasElement; scale: number }) {
  const base: React.CSSProperties = {
    position: 'absolute',
    left: el.x * scale,
    top: el.y * scale,
    width: el.width * scale,
    height: el.height * scale,
    zIndex: el.zIndex,
    opacity: el.style.opacity ?? 1,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
  };

  if (el.type === 'text') {
    return (
      <div
        style={{
          ...base,
          color: el.style.fill ?? '#000',
          fontSize: (el.style.fontSize ?? 24) * scale,
          fontWeight: el.style.fontWeight ?? 400,
          fontFamily: el.style.fontFamily ?? 'system-ui',
          textAlign: el.style.textAlign ?? 'left',
          lineHeight: el.style.lineHeight ?? 1.3,
          overflow: 'hidden',
        }}
      >
        {el.content}
      </div>
    );
  }

  if (el.type === 'shape') {
    return (
      <div
        style={{
          ...base,
          background: el.style.fill ?? '#3b82f6',
          borderRadius: el.shape === 'circle' ? '50%' : (el.style.borderRadius ?? 0) * scale,
          border: el.style.stroke ? `${(el.style.strokeWidth ?? 2) * scale}px solid ${el.style.stroke}` : undefined,
        }}
      />
    );
  }

  if (el.type === 'image') {
    return (
      <img
        src={el.src ?? 'https://placehold.co/200x150/e2e8f0/94a3b8?text=Image'}
        alt=""
        style={{
          ...base,
          objectFit: el.style.objectFit ?? 'cover',
          borderRadius: (el.style.borderRadius ?? 0) * scale,
          display: 'block',
        }}
      />
    );
  }

  return null;
}

function VariationCard({ variation, index }: { variation: DesignVariation; index: number }) {
  const canvasW = 1080;
  const canvasH = 1080;
  const scale = 180 / canvasW;

  const handleSelect = () => {
    document.dispatchEvent(
      new CustomEvent('studio:open-editor', { detail: variation }),
    );
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700">
      <button
        type="button"
        onClick={handleSelect}
        className="group flex cursor-pointer justify-center p-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
      >
        <div
          style={{
            width: canvasW * scale,
            height: canvasH * scale,
            background: variation.background || '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {variation.elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => (
              <MiniElement key={el.id} el={el} scale={scale} />
            ))}
        </div>
      </button>

      <div className="flex items-center justify-between border-t border-neutral-100 px-3 py-2 dark:border-neutral-800">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-neutral-800 dark:text-neutral-200">
            {variation.name}
          </p>
          <p className="text-[10px] text-neutral-400">Option {index + 1}</p>
        </div>
        <button
          type="button"
          onClick={handleSelect}
          className="shrink-0 cursor-pointer rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Use this
        </button>
      </div>
    </div>
  );
}

export function GenerateDesignResult({ data }: { data: DesignOutput }) {
  const variations = data.variations ?? [];

  if (variations.length === 0) return null;

  return (
    <div className="flex gap-3">
      {variations.map((v, i) => (
        <VariationCard key={v.id} variation={v} index={i} />
      ))}
    </div>
  );
}
