import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const STATE_COLORS = {
    S: 'bg-blue-500 text-white',
    I: 'bg-orange-500 text-white',
    P: 'bg-green-500 text-white',
    B: 'bg-red-500 text-white',
    D: 'bg-slate-500/50 text-slate-300',
    '-': 'bg-transparent text-slate-800',
};

const STATE_NAMES = {
    S: 'Subida (Viaje)',
    I: 'Inducción (Capacitación)',
    P: 'Perforación (Activo)',
    B: 'Bajada (Viaje)',
    D: 'Descanso (Libre)',
    '-': 'En Espera',
};

export default function ScheduleTable({ schedule }) {
    const days = Array.from({ length: schedule.stats.length }, (_, i) => i);

    return (
        <div className="relative overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full border-collapse text-xs text-center">
                <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800">
                        <th className="p-3 sticky left-0 bg-slate-900/90 z-10 w-24 text-slate-500 uppercase font-black">SUPERVISOR</th>
                        {days.map(day => (
                            <th key={day} className="p-2 min-w-[32px] font-medium text-slate-500">{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    <SupervisorRow label="S1" data={schedule.s1} />
                    <SupervisorRow label="S2" data={schedule.s2} />
                    <SupervisorRow label="S3" data={schedule.s3} />
                    <StatsRow label="#P" data={schedule.stats} errors={schedule.errors} />
                </tbody>
            </table>
        </div>
    );
}

function SupervisorRow({ label, data }) {
    return (
        <tr className="group hover:bg-slate-800/30 transition-colors">
            <td className="p-3 sticky left-0 bg-slate-900/90 z-10 font-bold text-slate-400 group-hover:text-slate-100 border-r border-slate-800/50">{label}</td>
            {data.map((state, i) => (
                <td key={i} className="p-1">
                    <div
                        title={`${STATE_NAMES[state] || ''} - Día ${i}`}
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all hover:scale-125 hover:z-20 cursor-help shadow-sm",
                            STATE_COLORS[state] || 'bg-slate-800 text-slate-600'
                        )}>
                        {state}
                    </div>
                </td>
            ))}
        </tr>
    );
}

function StatsRow({ label, data, errors }) {
    return (
        <tr className="bg-slate-900/50 border-t border-slate-700">
            <td className="p-3 sticky left-0 bg-slate-900/90 z-10 font-black text-slate-500">{label}</td>
            {data.map((count, i) => {
                const isDificit = errors.p1.includes(i);
                const isOver = errors.p3.includes(i);
                const isPattern = errors.patterns.some(p => p.day === i);

                return (
                    <td key={i} className="p-1">
                        <div
                            title={isDificit ? `Déficit: Solo 1 supervisor perforando en el día ${i}` : isOver ? `Exceso: 3 supervisores perforando en el día ${i}` : `Cobertura Correcta: ${count} supervisores perforando`}
                            id={`day-cell-${i}`}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center font-black rounded-lg transition-transform hover:scale-110 cursor-help",
                                isDificit && "bg-amber-500/20 text-amber-500 border border-amber-500/50",
                                isOver && "bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse",
                                isPattern && "border-2 border-dashed border-red-400",
                                !isDificit && !isOver && !isPattern && "text-slate-400"
                            )}>
                            {count}
                        </div>
                    </td>
                );
            })}
        </tr>
    );
}
