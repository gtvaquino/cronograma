import React, { useState, useEffect } from 'react';
import { Settings, Calendar, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import Papa from 'papaparse';
import ConfigForm from './components/ConfigForm';
import ScheduleTable from './components/ScheduleTable';
import { generateSchedule } from './logic/scheduler';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [config, setConfig] = useState({
    workDays: 14,
    offDays: 7,
    inductionDays: 5,
    totalDays: 30
  });

  const [schedule, setSchedule] = useState(null);

  const handleCalculate = (newConfig) => {
    setConfig(newConfig);
    const result = generateSchedule(
      newConfig.workDays,
      newConfig.offDays,
      newConfig.inductionDays,
      newConfig.totalDays
    );
    setSchedule(result);
  };

  const handleExport = (sched, cfg) => {
    const csvData = sched.stats.map((_, i) => ({
      Dia: i,
      S1: sched.s1[i],
      S2: sched.s2[i],
      S3: sched.s3[i],
      'Num Perforando': sched.stats[i]
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cronograma_${cfg.workDays}x${cfg.offDays}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScrollToDay = (day) => {
    const element = document.getElementById(`day-cell-${day}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      // Add a temporary highlight effect
      element.classList.add('ring-4', 'ring-blue-500', 'ring-offset-2', 'ring-offset-slate-900');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-blue-500', 'ring-offset-2', 'ring-offset-slate-900');
      }, 2000);
    }
  };

  // Initial calculation
  useEffect(() => {
    handleCalculate(config);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          CRONOGRAMA DE SUPERVISORES
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Algoritmo de turnos para operaciones mineras
        </p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl sticky top-8">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold">Configuración</h2>
            </div>
            <ConfigForm config={config} onCalculate={handleCalculate} />
          </div>
        </aside>

        <section className="lg:col-span-3 space-y-6">
          {schedule && (
            <>
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-bold">Cronograma Generado</h2>
                    <button
                      onClick={() => handleExport(schedule, config)}
                      className="ml-4 p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
                      title="Exportar a CSV"
                    >
                      <Download className="w-4 h-4" />
                      Exportar
                    </button>
                  </div>

                  {/* Legend - Responsive */}
                  <div className="hidden sm:flex items-center gap-4 text-xs">
                    <LegendItem color="bg-blue-500" label="S" />
                    <LegendItem color="bg-orange-500" label="I" />
                    <LegendItem color="bg-green-500" label="P" />
                    <LegendItem color="bg-red-500" label="B" />
                    <LegendItem color="bg-slate-500" label="D" />
                  </div>
                </div>

                <ScheduleTable schedule={schedule} />
              </div>

              {/* Status & Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusCard
                  title="Validación de Cobertura"
                  icon={schedule.errors.p1.length === 0 ? <CheckCircle2 className="text-emerald-400" /> : <AlertTriangle className="text-red-400" />}
                  value={schedule.errors.p1.length === 0 ? "Cumplida" : `${schedule.errors.p1.length} Días con déficit`}
                  description={schedule.errors.p1.length === 0 ? "Exactamente 2 supervisores en perforación." : "Se detectaron días con solo 1 supervisor perforando. Click para ver."}
                  status={schedule.errors.p1.length === 0 ? 'success' : 'error'}
                  onClick={schedule.errors.p1.length > 0 ? () => handleScrollToDay(schedule.errors.p1[0]) : undefined}
                />
                <StatusCard
                  title="Alertas de Seguridad"
                  icon={schedule.errors.p3.length === 0 && schedule.errors.patterns.length === 0 ? <CheckCircle2 className="text-blue-400" /> : <AlertTriangle className="text-amber-400" />}
                  value={schedule.errors.p3.length === 0 && schedule.errors.patterns.length === 0 ? "Sin Conflictos" : "Conflictos Detectados"}
                  description={schedule.errors.p3.length === 0 && schedule.errors.patterns.length === 0 ? "No se detectaron solapamientos o errores de patrón." : `Se encontraron incidencias. Click para ver la primera.`}
                  status={schedule.errors.p3.length === 0 && schedule.errors.patterns.length === 0 ? 'success' : 'warning'}
                  onClick={schedule.errors.p3.length > 0 ? () => handleScrollToDay(schedule.errors.p3[0]) : (schedule.errors.patterns.length > 0 ? () => handleScrollToDay(schedule.errors.patterns[0].day) : undefined)}
                />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-3 h-3 rounded-full", color)} />
      <span className="text-slate-400">{label}</span>
    </div>
  );
}

function StatusCard({ title, icon, value, description, status, onClick }) {
  const statusColors = {
    success: 'border-emerald-500/20 bg-emerald-500/5',
    error: 'border-red-500/20 bg-red-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    default: 'border-slate-800 bg-slate-900/40'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "border rounded-xl p-4 flex items-start gap-4 transition-all",
        statusColors[status] || statusColors.default,
        onClick && "cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 active:scale-95"
      )}>
      <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <p className="text-lg font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
    </div>
  );
}
