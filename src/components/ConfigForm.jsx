import React, { useState } from 'react';

export default function ConfigForm({ config, onCalculate }) {
    const [formData, setFormData] = useState(config);

    const presets = [
        { label: "Caso 1: 14x7 (5 I, 90 P)", workDays: 14, offDays: 7, inductionDays: 5, totalDays: 90 },
        { label: "Caso 2: 21x7 (3 I, 90 P)", workDays: 21, offDays: 7, inductionDays: 3, totalDays: 90 },
        { label: "Caso 3: 10x5 (2 I, 90 P)", workDays: 10, offDays: 5, inductionDays: 2, totalDays: 90 },
        { label: "Caso 4: 14x6 (4 I, 950 P)", workDays: 14, offDays: 6, inductionDays: 4, totalDays: 950 },
    ];

    const handleSelectPreset = (e) => {
        const index = parseInt(e.target.value, 10);
        if (isNaN(index)) return;
        const preset = presets[index];
        const newConfig = {
            workDays: preset.workDays,
            offDays: preset.offDays,
            inductionDays: preset.inductionDays,
            totalDays: preset.totalDays,
        };
        setFormData(newConfig);
        // Automatically trigger calculation when selecting a preset
        onCalculate(newConfig);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseInt(value, 10) || 0
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCalculate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Escoger Régimen de Prueba
                </label>
                <select
                    onChange={handleSelectPreset}
                    className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value=""
                >
                    <option value="" disabled>Seleccione un caso...</option>
                    {presets.map((p, i) => (
                        <option key={i} value={i}>{p.label}</option>
                    ))}
                </select>
                <div className="mt-4 border-t border-slate-800 pt-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold text-center tracking-widest">Ajustes Manuales</p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Régimen Trabajo (N)
                </label>
                <input
                    type="number"
                    name="workDays"
                    value={formData.workDays}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    placeholder="Ej: 14"
                    min="1"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Régimen Descanso (M)
                </label>
                <input
                    type="number"
                    name="offDays"
                    value={formData.offDays}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    placeholder="Ej: 7"
                    min="1"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Días Inducción (I)
                </label>
                <input
                    type="number"
                    name="inductionDays"
                    value={formData.inductionDays}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    placeholder="Ej: 5"
                    min="1"
                    max="5"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Total Días Perforación
                </label>
                <input
                    type="number"
                    name="totalDays"
                    value={formData.totalDays}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border-0 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    placeholder="Ej: 30"
                    min="7"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4"
            >
                Calcular Cronograma
            </button>
        </form>
    );
}
