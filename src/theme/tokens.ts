// Theme token definitions for Swiss Spa redesign phase
// Neutral-focused palette with subtle semantic accents.
// All components should reference CSS variables derived from these tokens.

export const color = {
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFA',
    100: '#F2F4F5',
    150: '#E9ECEE',
    200: '#E1E5E8',
    300: '#CED4D9',
    400: '#A8B1B7',
    500: '#7E8991',
    600: '#5B666E',
    700: '#404A51',
    800: '#2A3237',
    900: '#1C2226',
    950: '#121618'
  },
  accent: {
    success: '#4C8361', // muted alpine green
    successSoft: '#E5F3EC',
    warning: '#B89444', // warm muted amber
    warningSoft: '#F8F1E2',
    critical: '#B65A54', // desaturated terracotta
    criticalSoft: '#F7E9E8',
    info: '#4F6FA8',
    infoSoft: '#E6EEF8'
  },
  focus: {
    ring: '#6A9ECF',
    ringSubtle: '#D8E8F5'
  }
};

export const radius = {
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '10px',
  xl: '16px',
  pill: '999px'
};

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
  7: '40px',
  8: '48px'
};

export const elevation = {
  surface: '0 0 0 1px rgba(0,0,0,0.05)',
  raised: '0 2px 4px -2px rgba(0,0,0,0.08), 0 4px 8px -2px rgba(0,0,0,0.06)',
  overlay: '0 4px 12px -2px rgba(0,0,0,0.12), 0 12px 24px -4px rgba(0,0,0,0.10)'
};

export const typography = {
  fontFamilySans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.8125rem',
    base: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    h5: '1.375rem',
    h4: '1.5rem',
    h3: '1.75rem',
    h2: '2rem',
    h1: '2.5rem'
  },
  lineHeights: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.55
  }
};

export const motion = {
  duration: {
    fast: '60ms',
    base: '120ms',
    slow: '160ms'
  },
  easing: {
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

export const vitalsThresholds = {
  bloodPressure: { systolic: { normal: [0, 119], elevated: [120, 139], critical: [140, 1000] }, diastolic: { normal: [0, 79], elevated: [80, 89], critical: [90, 1000] } },
  heartRate: { normal: [60, 100], elevated: [101, 110], criticalLow: [0, 49], criticalHigh: [111, 300] },
  spo2: { normal: [95, 100], elevated: [93, 94], critical: [0, 92] },
  temperatureF: { normal: [97.8, 99.1], elevated: [99.2, 100.3], criticalHigh: [100.4, 120], criticalLow: [0, 95.4] },
  temperatureC: { normal: [36.5, 37.2], elevated: [37.3, 38.0], criticalHigh: [38.1, 45], criticalLow: [0, 35.0] },
  respiratoryRate: { normal: [12, 18], elevated: [19, 22], criticalLow: [0, 9], criticalHigh: [23, 60] },
  glucoseFasting: { normal: [70, 99], elevated: [100, 125], critical: [126, 1000] }
};

export type VitalStatus = 'normal' | 'elevated' | 'critical';

export function classifyVital(metric: keyof typeof vitalsThresholds, value: number, context?: { systolic?: number; diastolic?: number; }): VitalStatus {
  if (metric === 'bloodPressure') {
    if (!context?.systolic || !context?.diastolic) return 'normal';
    const s = context.systolic; const d = context.diastolic;
    const bp = vitalsThresholds.bloodPressure;
    const sStatus = s >= bp.systolic.critical[0] ? 'critical' : s >= bp.systolic.elevated[0] ? 'elevated' : 'normal';
    const dStatus = d >= bp.diastolic.critical[0] ? 'critical' : d >= bp.diastolic.elevated[0] ? 'elevated' : 'normal';
    return (sStatus === 'critical' || dStatus === 'critical') ? 'critical' : (sStatus === 'elevated' || dStatus === 'elevated') ? 'elevated' : 'normal';
  }
  const t = vitalsThresholds[metric as Exclude<keyof typeof vitalsThresholds, 'bloodPressure'>];
  if (!t) return 'normal';
  // Generic pattern resolvers
  if ('critical' in t && value >= (t as any).critical[0] && value <= (t as any).critical[1]) return 'critical';
  if ('criticalHigh' in t && value >= (t as any).criticalHigh[0]) return 'critical';
  if ('criticalLow' in t && value <= (t as any).criticalLow[1]) return 'critical';
  if (value >= (t as any).elevated[0] && value <= (t as any).elevated[1]) return 'elevated';
  return 'normal';
}

export const tokens = { color, radius, spacing, elevation, typography, motion, vitalsThresholds };

export default tokens;
