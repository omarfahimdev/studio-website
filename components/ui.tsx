'use client';

const field = 'w-full bg-studio-950 border border-studio-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500';

export const Slider = ({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void;
}) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs text-gray-400"><span>{label}</span><span>{value}{unit}</span></div>
    <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
  </div>
);

export const ColorField = ({ label, value, onChange, showHex }: {
  label: string; value: string; onChange: (v: string) => void; showHex?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-400">{label}</span>
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-7 h-7 rounded border border-studio-700 cursor-pointer bg-transparent" />
      {showHex && <span className="text-xs font-mono text-gray-300">{value}</span>}
    </div>
  </div>
);

export function Seg<T extends string>({ options, value, onChange }: {
  options: [T, React.ReactNode][]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map(([k, label]) => (
        <button key={k} onClick={() => onChange(k)}
          className={`flex-1 py-1.5 text-xs rounded-md font-medium flex items-center justify-center transition-all ${
            k === value ? 'bg-indigo-600 text-white' : 'bg-studio-800 text-gray-300 hover:bg-studio-700'}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

export const Select = ({ value, onChange, children, className = field }: {
  value: string | number; onChange: (v: string) => void; children: React.ReactNode; className?: string;
}) => <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>{children}</select>;

export const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
    className={`relative w-8 h-4 rounded-full transition-all ${checked ? 'bg-indigo-600' : 'bg-studio-700'}`}>
    <span className={`absolute top-[2px] left-[2px] w-3 h-3 bg-white rounded-full transition-all ${checked ? 'translate-x-4' : ''}`} />
  </button>
);

export const Check = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-400">{label}</span>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      className="rounded bg-studio-800 border-studio-700 text-indigo-600 focus:ring-0" />
  </div>
);

export const Label = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">{icon}{children}</label>
);

export const selectCls = field;
