
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Thermometer, Weight, Wind, Droplet } from 'lucide-react';
import StatusChip from '@/components/ui/StatusChip';
import Sparkline from '@/components/ui/Sparkline';
import { useHealthData } from '@/contexts/HealthDataContext';
import { format, parseISO } from 'date-fns';
import { classifyVital } from '@/theme/tokens';

type Status = 'normal' | 'elevated' | 'critical';

const VitalTracker: React.FC = () => {
  const { vitalSigns } = useHealthData();
  const [range, setRange] = useState<'7d' | '30d' | '1y'>('7d');

  const averageVitals = (arr: typeof vitalSigns): any => {
    const temperatureSelector = (v: any) => v.temperature as number | undefined;
    const avg = (sel: (v: any) => number | undefined, precision: number) => {
      const nums = arr.map(sel).filter((n): n is number => typeof n === 'number');
      if (!nums.length) return undefined;
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      return parseFloat(mean.toFixed(precision));
    };
    const ref = arr[arr.length - 1];
    return {
      id: 'agg-' + ref.id,
      recordedDate: ref.recordedDate,
      bloodPressureSystolic: avg((v: any) => v.bloodPressureSystolic, 0),
      bloodPressureDiastolic: avg((v: any) => v.bloodPressureDiastolic, 0),
      heartRate: avg((v: any) => v.heartRate, 0),
      temperature: avg(temperatureSelector, 1),
      oxygenSaturation: avg((v: any) => v.oxygenSaturation, 0),
      respiratoryRate: avg((v: any) => v.respiratoryRate, 0),
      bloodGlucose: avg((v: any) => v.bloodGlucose, 0),
      sampleCount: arr.length
    };
  };

  // Helper aggregations
  const aggregate = useMemo(() => {
    if (!vitalSigns.length) return [] as typeof vitalSigns;
    const now = new Date();
    const clone = [...vitalSigns].sort((a, b) => new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime());
    const sliceFor = (days: number) => clone.filter(v => new Date(v.recordedDate).getTime() >= now.getTime() - days * 24 * 60 * 60 * 1000);
    if (range === '7d') return sliceFor(7);
    if (range === '30d') {
      const pts = sliceFor(30);
      const buckets: Record<string, typeof pts> = {};
      pts.forEach(v => {
        const d = new Date(v.recordedDate);
        const key = `${d.getFullYear()}-W${Math.floor((d.getDate() - 1) / 7)}`;
        (buckets[key] ||= []).push(v);
      });
      return Object.values(buckets).map(arr => averageVitals(arr));
    }
    // 1y monthly avg
    const buckets: Record<string, typeof clone> = {};
    clone.forEach(v => {
      const d = new Date(v.recordedDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      (buckets[key] ||= []).push(v);
    });
    return Object.values(buckets).map(arr => averageVitals(arr));
  }, [vitalSigns, range]);

  const sourceData = aggregate.length ? aggregate : vitalSigns;
  const chartData = sourceData
    .sort((a, b) => new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime())
    .map(v => ({
      date: format(parseISO(v.recordedDate), 'MMM dd'),
      fullDate: v.recordedDate,
      systolic: v.bloodPressureSystolic,
      diastolic: v.bloodPressureDiastolic,
      heartRate: v.heartRate,
      oxygenSaturation: (v as any).oxygenSaturation,
      weight: v.weight,
      temperature: v.temperature,
      respiratoryRate: (v as any).respiratoryRate,
      bloodGlucose: (v as any).bloodGlucose,
      sampleCount: (v as any).sampleCount || 1
    }));

  // Dynamic BP axis domain so small variations are visible (esp. 7d window)
  const bpDomain = useMemo<[number, number]>(() => {
    const values = chartData.flatMap(d => [d.systolic, d.diastolic]).filter((n): n is number => typeof n === 'number');
    if (!values.length) return [50, 160];
    let min = Math.min(...values);
    let max = Math.max(...values);
    // If narrow spread (e.g., 7d) widen a little for readability
    const spread = max - min;
    if (spread < 12) { min -= 6; max += 6; }
    min = Math.max(40, Math.floor(min - 2));
    max = Math.min(200, Math.ceil(max + 2));
    return [min, max];
  }, [chartData, range]);

  const aggregationLabel = range === '7d' ? 'Raw Daily Values' : range === '30d' ? 'Weekly Averages (Last 30d)' : 'Monthly Averages (Last 12m)';

  const latest = () => (vitalSigns.length ? vitalSigns[vitalSigns.length - 1] : null);
  const getNum = (k: keyof typeof vitalSigns[0]) => {
    const l = latest();
    if (!l) return undefined;
    const val = l[k];
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val);
    return undefined;
  };
  const fmt = (v: number | undefined, unit: string) => (v != null ? `${Number.isInteger(v) ? v : v.toFixed(1)}${unit}` : 'No data');

  const classify = {
    heartRate: (v?: number) => (v != null ? classifyVital('heartRate', v) : undefined),
    oxygen: (v?: number) => (v != null ? classifyVital('spo2', v) : undefined),
    // Use temperatureC classifier for Celsius values
    temp: (v?: number) => (v != null ? classifyVital('temperatureC', v) : undefined),
    bp: (s?: number, d?: number) => (s != null && d != null ? classifyVital('bloodPressure', s, { systolic: s, diastolic: d }) : undefined)
  };

  // Manual classify for respiratory & glucose (not in tokens)
  const classifyResp = (v?: number): Status | undefined => {
    if (v == null) return undefined;
    if (v >= 24 || v <= 10) return 'critical';
    if (v >= 20) return 'elevated';
    return 'normal';
  };
  const classifyGlucose = (v?: number): Status | undefined => {
    if (v == null) return undefined;
    if (v >= 180) return 'critical';
    if (v >= 140) return 'elevated';
    return 'normal';
  };

  if (!vitalSigns.length) {
    return (
      <Card className="bg-surface-card border border-border-divider elev-surface">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary-action" />
            <span>Vital Signs Tracker</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No Vital Signs Data</h3>
            <p className="text-text-secondary">Start tracking your vitals to see trends over time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--medimo-accent-soft)] flex items-center justify-center">
              <Activity className="h-5 w-5 text-[var(--medimo-accent)]" />
            </div>
            <div>
              <span className="font-display font-semibold text-[var(--medimo-text-primary)]">Vitals</span>
              <p className="text-xs text-[var(--medimo-text-muted)] font-normal mt-0.5">{aggregationLabel}</p>
            </div>
          </CardTitle>

          {/* Time range pills */}
          <div className="flex gap-1 bg-[var(--medimo-bg-secondary)] rounded-lg p-1">
            {(['7d', '30d', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${range === r
                    ? 'bg-[var(--medimo-bg-elevated)] text-[var(--medimo-text-primary)] shadow-sm'
                    : 'text-[var(--medimo-text-muted)] hover:text-[var(--medimo-text-secondary)]'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Apple-style Vital Cards - 3 key metrics only */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Heart Rate - Hero metric */}
          {(() => {
            const val = getNum('heartRate');
            const status = classify.heartRate(val) as Status | undefined;
            const hrSeries = chartData.map(d => d.heartRate).filter(v => typeof v === 'number').slice(-12) as number[];
            return (
              <div className="relative p-5 rounded-2xl bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] overflow-hidden group hover:border-[var(--medimo-accent)]/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-rose-500" />
                    </div>
                    <span className="text-sm font-medium text-[var(--medimo-text-secondary)]">Heart Rate</span>
                  </div>
                  {status && (
                    <div className={`w-2 h-2 rounded-full ${status === 'critical' ? 'bg-rose-500' : status === 'elevated' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-[var(--medimo-text-primary)] tabular-nums">
                    {val != null ? Math.round(val) : '—'}
                  </span>
                  <span className="text-sm text-[var(--medimo-text-muted)]">bpm</span>
                </div>
                {hrSeries.length > 1 && (
                  <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={hrSeries} stroke="rgb(244, 63, 94)" strokeWidth={2} className="w-full h-8" ariaLabel="heart rate trend" />
                  </div>
                )}
              </div>
            );
          })()}

          {/* Blood Pressure */}
          {(() => {
            let sVal = getNum('bloodPressureSystolic');
            let dVal = getNum('bloodPressureDiastolic');
            if (typeof sVal === 'number') sVal = Math.round(sVal);
            if (typeof dVal === 'number') dVal = Math.round(dVal);
            const st = classify.bp(sVal, dVal) as Status | undefined;
            const bpSysSeries = chartData.map(d => d.systolic).filter(v => typeof v === 'number').slice(-12) as number[];
            return (
              <div className="relative p-5 rounded-2xl bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] overflow-hidden group hover:border-[var(--medimo-accent)]/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-violet-500" />
                    </div>
                    <span className="text-sm font-medium text-[var(--medimo-text-secondary)]">Blood Pressure</span>
                  </div>
                  {st && (
                    <div className={`w-2 h-2 rounded-full ${st === 'critical' ? 'bg-rose-500' : st === 'elevated' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-[var(--medimo-text-primary)] tabular-nums">
                    {(typeof sVal === 'number' && typeof dVal === 'number') ? `${sVal}/${dVal}` : '—/—'}
                  </span>
                  <span className="text-sm text-[var(--medimo-text-muted)]">mmHg</span>
                </div>
                {bpSysSeries.length > 1 && (
                  <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={bpSysSeries} stroke="rgb(139, 92, 246)" strokeWidth={2} className="w-full h-8" ariaLabel="blood pressure trend" />
                  </div>
                )}
              </div>
            );
          })()}

          {/* Oxygen Saturation */}
          {(() => {
            const val = getNum('oxygenSaturation' as any);
            const st = classify.oxygen(val) as Status | undefined;
            const oxySeries = chartData.map(d => d.oxygenSaturation).filter(v => typeof v === 'number').slice(-12) as number[];
            return (
              <div className="relative p-5 rounded-2xl bg-[var(--medimo-bg-elevated)] border border-[var(--medimo-border)] overflow-hidden group hover:border-[var(--medimo-accent)]/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                      <Wind className="h-4 w-4 text-sky-500" />
                    </div>
                    <span className="text-sm font-medium text-[var(--medimo-text-secondary)]">SpO₂</span>
                  </div>
                  {st && (
                    <div className={`w-2 h-2 rounded-full ${st === 'critical' ? 'bg-rose-500' : st === 'elevated' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-[var(--medimo-text-primary)] tabular-nums">
                    {val != null ? Math.round(val) : '—'}
                  </span>
                  <span className="text-sm text-[var(--medimo-text-muted)]">%</span>
                </div>
                {oxySeries.length > 1 && (
                  <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={oxySeries} stroke="rgb(14, 165, 233)" strokeWidth={2} className="w-full h-8" ariaLabel="oxygen trend" />
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Secondary metrics - collapsible row */}
        <details className="group mb-6">
          <summary className="flex items-center gap-2 cursor-pointer text-sm text-[var(--medimo-text-muted)] hover:text-[var(--medimo-text-secondary)] transition-colors mb-3">
            <span className="font-medium">More vitals</span>
            <svg className="w-4 h-4 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </summary>
          <div className="grid grid-cols-3 gap-3">
            {/* Temperature */}
            {(() => {
              const val = getNum('temperature');
              const st = classify.temp(val) as Status | undefined;
              return (
                <div className="p-4 rounded-xl bg-[var(--medimo-bg-secondary)] flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span className="text-xs text-[var(--medimo-text-muted)]">Temp</span>
                    {st && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${st === 'critical' ? 'bg-rose-500' : st === 'elevated' ? 'bg-amber-500' : 'bg-emerald-500'}`} />}
                  </div>
                  <span className="font-display text-xl font-bold text-[var(--medimo-text-primary)] tabular-nums">{fmt(val, '°')}</span>
                </div>
              );
            })()}
            {/* Respiratory Rate */}
            {(() => {
              const val = getNum('respiratoryRate' as any);
              const st = classifyResp(val) as Status | undefined;
              return (
                <div className="p-4 rounded-xl bg-[var(--medimo-bg-secondary)] flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-4 w-4 text-teal-500" />
                    <span className="text-xs text-[var(--medimo-text-muted)]">Resp</span>
                    {st && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${st === 'critical' ? 'bg-rose-500' : st === 'elevated' ? 'bg-amber-500' : 'bg-emerald-500'}`} />}
                  </div>
                  <span className="font-display text-xl font-bold text-[var(--medimo-text-primary)] tabular-nums">{fmt(val, '')}<span className="text-xs text-[var(--medimo-text-muted)] ml-0.5">/min</span></span>
                </div>
              );
            })()}
            {/* Blood Glucose */}
            {(() => {
              const val = getNum('bloodGlucose' as any);
              const st = classifyGlucose(val) as Status | undefined;
              return (
                <div className="p-4 rounded-xl bg-[var(--medimo-bg-secondary)] flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-[var(--medimo-text-muted)]">Glucose</span>
                    {st && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${st === 'critical' ? 'bg-rose-500' : st === 'elevated' ? 'bg-amber-500' : 'bg-emerald-500'}`} />}
                  </div>
                  <span className="font-display text-xl font-bold text-[var(--medimo-text-primary)] tabular-nums">{fmt(val, '')}<span className="text-xs text-[var(--medimo-text-muted)] ml-0.5">mg/dL</span></span>
                </div>
              );
            })()}
          </div>
        </details>
        {chartData.some(d => d.systolic || d.diastolic) && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-primary mb-3">Blood Pressure Trend</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hc-chart-grid)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--hc-chart-axis)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--hc-chart-axis)" domain={bpDomain} />
                  <Tooltip labelFormatter={(label, items: any) => {
                    const c = items && items[0] && items[0].payload.sampleCount;
                    return `Date: ${label}${c ? ` (${c} sample${c > 1 ? 's' : ''})` : ''}`;
                  }} formatter={(value: any, name: any) => [value, name === 'systolic' ? 'Systolic' : 'Diastolic']} />
                  <Line type="monotone" dataKey="systolic" stroke="var(--hc-accent-critical)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 5 }} connectNulls={false} />
                  <Line type="monotone" dataKey="diastolic" stroke="var(--hc-accent-warning)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 5 }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {chartData.some(d => d.heartRate) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-primary mb-3">Heart Rate Trend</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hc-chart-grid)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--hc-chart-axis)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--hc-chart-axis)" domain={[40, 130]} />
                  <Tooltip labelFormatter={(label, items: any) => {
                    const c = items && items[0] && items[0].payload.sampleCount; return `Date: ${label}${c ? ` (${c} sample${c > 1 ? 's' : ''})` : ''}`;
                  }} formatter={(value: any) => [value + ' bpm', 'Heart Rate']} />
                  <Line type="monotone" dataKey="heartRate" stroke="var(--hc-accent-info)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {chartData.some(d => d.respiratoryRate) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-primary mb-3">Respiratory Rate Trend</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hc-chart-grid)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--hc-chart-axis)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--hc-chart-axis)" domain={[8, 28]} />
                  <Tooltip labelFormatter={(label, items: any) => {
                    const c = items && items[0] && items[0].payload.sampleCount; return `Date: ${label}${c ? ` (${c} sample${c > 1 ? 's' : ''})` : ''}`;
                  }} formatter={(value: any) => [value + ' rpm', 'Resp. Rate']} />
                  <Line type="monotone" dataKey="respiratoryRate" stroke="var(--hc-accent-warning)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {chartData.some(d => d.bloodGlucose) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-text-primary mb-3">Blood Glucose Trend</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--hc-chart-grid)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--hc-chart-axis)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--hc-chart-axis)" domain={[70, 210]} />
                  <Tooltip labelFormatter={(label, items: any) => {
                    const c = items && items[0] && items[0].payload.sampleCount; return `Date: ${label}${c ? ` (${c} sample${c > 1 ? 's' : ''})` : ''}`;
                  }} formatter={(value: any) => [value + ' mg/dL', 'Glucose']} />
                  <Line type="monotone" dataKey="bloodGlucose" stroke="var(--hc-accent-critical)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VitalTracker;
