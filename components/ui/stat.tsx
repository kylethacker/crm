export function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 rounded-[10px] bg-white px-2.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-neutral-900 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.05)]">
      <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{value}</p>
      <p className="text-xs text-neutral-400">{label}</p>
    </div>
  );
}
