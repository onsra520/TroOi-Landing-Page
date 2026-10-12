type Series = { name: string; values: number[] };

const W = 600;
const H = 240;
const L = 44;
const R = 14;
const T = 14;
const B = 28;
const STEPS = 5;

// Làm tròn trần trục Y để mỗi vạch chia (max / 5) là số đẹp.
const niceMax = (m: number) => {
  const step = 10 ** Math.floor(Math.log10(m)) / 2;
  return Math.ceil(m / step) * step;
};
const tick = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v));

export default function LineChart({
  title,
  labels,
  series,
}: {
  title: string;
  labels: string[];
  series: Series[];
}) {
  const max = niceMax(Math.max(...series.flatMap((s) => s.values)));
  const last = labels.length - 1;
  const x = (i: number) => L + (i * (W - L - R)) / last;
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const points = (v: number[]) => v.map((n, i) => `${x(i)},${y(n)}`).join(' ');
  const summary = series
    .map((s) => `${s.name} từ ${s.values[0]} lên ${s.values[last]}`)
    .join('; ');

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: ${summary}`}>
        {Array.from({ length: STEPS + 1 }, (_, i) => {
          const v = (max * i) / STEPS;
          return (
            <g key={i}>
              <line className="grid-line" x1={L} x2={W - R} y1={y(v)} y2={y(v)} />
              <text x={L - 8} y={y(v) + 4} textAnchor="end">
                {tick(v)}
              </text>
            </g>
          );
        })}
        {labels.map((l, i) =>
          (last - i) % 2 === 0 ? (
            <text key={l} x={x(i)} y={H - 8} textAnchor="middle">
              {l}
            </text>
          ) : null
        )}
        {series.map((s, si) => (
          <g key={s.name} className={`series-${si}`}>
            {si === 0 && (
              <polygon className="area" points={`${L},${y(0)} ${points(s.values)} ${x(last)},${y(0)}`} />
            )}
            <polyline className="line" points={points(s.values)} />
            {s.values.map((n, i) => (
              <circle key={i} className="dot" cx={x(i)} cy={y(n)} r={3.5}>
                <title>{`${labels[i]} · ${s.name}: ${n}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
      <figcaption>
        <ul className="legend">
          {series.map((s, si) => (
            <li key={s.name} className={`series-${si}`}>
              <i aria-hidden="true" /> {s.name}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
