import { useRef, useState } from 'react';

interface Point {
  date: string;
  count: number;
  total: number;
}

const W = 640;
const H = 150;
const PAD_X = 6;
const PAD_Y = 14;

export default function TrendChart({ data }: { data: Point[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="text-stone-400 text-sm px-6 py-12 text-center">Sin consultas en el período.</p>;
  }

  const max = Math.max(...data.map(d => d.count), 1);
  const n = data.length;
  const x = (i: number) => PAD_X + (n === 1 ? (W - PAD_X * 2) / 2 : (i / (n - 1)) * (W - PAD_X * 2));
  const y = (v: number) => H - PAD_Y - (v / max) * (H - PAD_Y * 2);

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.count).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(n - 1).toFixed(1)} ${H - PAD_Y} L ${x(0).toFixed(1)} ${H - PAD_Y} Z`;

  const fmtDay = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((px - PAD_X) / (W - PAD_X * 2)) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, idx)));
  };

  return (
    <div className="px-6 py-5">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto touch-none"
        preserveAspectRatio="none"
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a98046" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#a98046" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trendFill)" />
        <path d={line} fill="none" stroke="#a98046" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {hover !== null && (
          <>
            <line x1={x(hover)} y1={PAD_Y} x2={x(hover)} y2={H - PAD_Y} stroke="#d6cdbb" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={x(hover)} cy={y(data[hover].count)} r="4" fill="#a98046" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>

      <div className="flex items-center justify-between mt-2 text-[11px] text-stone-400">
        {hover !== null ? (
          <span className="text-ink font-medium">
            {fmtDay(data[hover].date)}: {data[hover].count} consulta{data[hover].count === 1 ? '' : 's'}
          </span>
        ) : (
          <>
            <span>{fmtDay(data[0].date)}</span>
            <span>{fmtDay(data[n - 1].date)}</span>
          </>
        )}
      </div>
    </div>
  );
}
