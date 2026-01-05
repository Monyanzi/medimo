import React, { useMemo } from 'react';

interface SparklineProps {
  data: (number | null | undefined)[];
  stroke?: string;
  strokeWidth?: number;
  smooth?: boolean;
  className?: string;
  ariaLabel?: string;
}

// Simple inline sparkline (no external deps beyond React)
export const Sparkline: React.FC<SparklineProps> = ({
  data,
  stroke = 'currentColor',
  strokeWidth = 2,
  smooth = true,
  className = '',
  ariaLabel = 'trend'
}) => {
  // useMemo must be called unconditionally (Rules of Hooks)
  // Filtering is done inside memo to avoid ephemeral dependency
  const { path, min, max, insufficient } = useMemo(() => {
    const filtered = data.filter(v => typeof v === 'number') as number[];
    if (filtered.length < 2) {
      return { path: '', min: 0, max: 0, insufficient: true };
    }

    const vals = filtered;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const points = vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return { x, y };
    });
    if (!smooth) {
      const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
      return { path: d, min, max, insufficient: false };
    }
    // Simple smoothing (Catmull-Rom to Bezier approximation)
    const toBezier = (pts: { x: number; y: number }[]) => {
      if (pts.length < 2) return '';
      let d = `M${pts[0].x},${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i === 0 ? i : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      return d;
    };
    return { path: toBezier(points), min, max, insufficient: false };
  }, [data, smooth]);

  if (insufficient) {
    return <div className={`sparkline ${className}`} aria-label={`${ariaLabel}: insufficient data`} />;
  }

  return (
    <div className={`sparkline ${className}`} aria-label={`${ariaLabel}: min ${min}, max ${max}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-hidden="true">
        <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export default Sparkline;