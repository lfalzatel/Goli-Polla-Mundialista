/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Partido, Apuesta, BonificacionesEspeciales } from '../types';
import { calcularPuntosPartido } from '../data';
import confetti from 'canvas-confetti';

interface InicioTabProps {
  partidos: Partido[];
  apuestas: Apuesta[];
  bonificaciones?: BonificacionesEspeciales | null;
  isAdmin: boolean;
  onGuardarApuesta: (partidoId: string, golesLocal: number, golesVisitante: number, totalGolesApuesta?: "mas25" | "menos25" | null) => void;
  onGuardarBonificaciones?: (bonos: Partial<BonificacionesEspeciales>) => void;
  onSimularPartidos: (marcadoresRealistas: Record<string, { golesLocal: number, golesVisitante: number }>) => void;
}

export default function InicioTab({ partidos, apuestas, bonificaciones, isAdmin, onGuardarApuesta, onGuardarBonificaciones, onSimularPartidos }: InicioTabProps) {
  // Local state for interactive editing of scores before saving
  const [editingScores, setEditingScores] = useState<Record<string, { golesLocal: number; golesVisitante: number; totalGolesApuesta?: "mas25" | "menos25" | null }>>({});
  const [editingBonos, setEditingBonos] = useState<Partial<BonificacionesEspeciales>>(bonificaciones || {});
  const [isBonosExpanded, setIsBonosExpanded] = useState(false);
  const [notifText, setNotifText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  React.useEffect(() => {
    if (bonificaciones) {
      setEditingBonos(bonificaciones);
    }
  }, [bonificaciones]);

  // Extract unique teams for selectors
  const equiposSet = new Set<string>();
  partidos.forEach(p => {
    equiposSet.add(p.equipoLocal);
    equiposSet.add(p.equipoVisitante);
  });
  const equiposOrdenados = Array.from(equiposSet).sort();

  // Extract dates for heatmap calendar
  const dateCounts: Record<string, number> = {};
  partidos.forEach(p => {
    dateCounts[p.fecha] = (dateCounts[p.fecha] || 0) + 1;
  });
  const uniqueDates = Object.keys(dateCounts);

  // Bloqueo de Bonificaciones Especiales (Inicio de Octavos: Aprox 27 Junio 2026)
  const isBonosLocked = Date.now() >= new Date('2026-06-27T00:00:00').getTime();

  const handleSaveBonos = () => {
    if (onGuardarBonificaciones) {
      onGuardarBonificaciones(editingBonos);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e1b12c', '#ffffff']
      });
      setNotifText('¡Bonificaciones Globales guardadas!');
      setTimeout(() => setNotifText(''), 4000);
    }
  };

  // Ajuste dinámico de estado: Si es "pendiente" pero la hora ya pasó, tratarlo como "en_vivo" en la interfaz
  const now = Date.now();
  const partidosComputados = partidos.map(p => {
    let computedEstado = p.estado;
    if (computedEstado === 'pendiente' && p.fechaHoraInicio <= now) {
      computedEstado = 'en_vivo';
    }
    return { ...p, estado: computedEstado };
  });

  // Filter matches based on search term (universal filter) and selected date
  const filteredPartidos = partidosComputados.filter(p => {
    if (selectedDate && p.fecha !== selectedDate) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.equipoLocal.toLowerCase().includes(term) ||
           p.equipoVisitante.toLowerCase().includes(term) ||
           p.grupoTorneo.toLowerCase().includes(term) ||
           p.fecha.toLowerCase().includes(term) ||
           p.estadio.toLowerCase().includes(term);
  }).sort((a, b) => {
    // Ordenar primero en_vivo, luego pendiente, luego finalizado
    const estadoOrder: Record<string, number> = {
      'en_vivo': 1,
      'pendiente': 2,
      'finalizado': 3
    };
    
    if (estadoOrder[a.estado] !== estadoOrder[b.estado]) {
      return estadoOrder[a.estado] - estadoOrder[b.estado];
    }
    
    // Si tienen el mismo estado, ordenar por fecha (cronológico)
    return a.fechaHoraInicio - b.fechaHoraInicio;
  });

  // Group matches by estado, then by date
  const partidosPorEstadoYFecha: Record<string, Record<string, Partido[]>> = {
    'en_vivo': {},
    'pendiente': {},
    'finalizado': {}
  };
  filteredPartidos.forEach(p => {
    if (!partidosPorEstadoYFecha[p.estado]) {
      partidosPorEstadoYFecha[p.estado] = {};
    }
    if (!partidosPorEstadoYFecha[p.estado][p.fecha]) {
      partidosPorEstadoYFecha[p.estado][p.fecha] = [];
    }
    partidosPorEstadoYFecha[p.estado][p.fecha].push(p);
  });

  const getApuestaForPartido = (partidoId: string) => {
    return apuestas.find(a => a.partidoId === partidoId);
  };

  const getEditingLocalScore = (partidoId: string, defaultVal: number) => {
    if (editingScores[partidoId] !== undefined) {
      return editingScores[partidoId].golesLocal;
    }
    const apuesta = getApuestaForPartido(partidoId);
    return apuesta ? apuesta.golesLocalApuesta : defaultVal;
  };

  const getEditingVisitanteScore = (partidoId: string, defaultVal: number) => {
    if (editingScores[partidoId] !== undefined) {
      return editingScores[partidoId].golesVisitante;
    }
    const apuesta = getApuestaForPartido(partidoId);
    return apuesta ? apuesta.golesVisitanteApuesta : defaultVal;
  };

  const setLocalScore = (partidoId: string, value: number) => {
    const val = Math.max(0, value);
    const existing = editingScores[partidoId] || {
      golesLocal: getApuestaForPartido(partidoId)?.golesLocalApuesta ?? 0,
      golesVisitante: getApuestaForPartido(partidoId)?.golesVisitanteApuesta ?? 0,
      totalGolesApuesta: getApuestaForPartido(partidoId)?.totalGolesApuesta ?? null
    };
    setEditingScores({
      ...editingScores,
      [partidoId]: { ...existing, golesLocal: val }
    });
  };

  const setVisitanteScore = (partidoId: string, value: number) => {
    const val = Math.max(0, value);
    const existing = editingScores[partidoId] || {
      golesLocal: getApuestaForPartido(partidoId)?.golesLocalApuesta ?? 0,
      golesVisitante: getApuestaForPartido(partidoId)?.golesVisitanteApuesta ?? 0,
      totalGolesApuesta: getApuestaForPartido(partidoId)?.totalGolesApuesta ?? null
    };
    setEditingScores({
      ...editingScores,
      [partidoId]: { ...existing, golesVisitante: val }
    });
  };

  const setOverUnderScore = (partidoId: string, value: "mas25" | "menos25" | null) => {
    const existing = editingScores[partidoId] || {
      golesLocal: getApuestaForPartido(partidoId)?.golesLocalApuesta ?? 0,
      golesVisitante: getApuestaForPartido(partidoId)?.golesVisitanteApuesta ?? 0,
      totalGolesApuesta: getApuestaForPartido(partidoId)?.totalGolesApuesta ?? null
    };
    setEditingScores({
      ...editingScores,
      [partidoId]: { ...existing, totalGolesApuesta: value }
    });
  };

  const getEditingOverUnder = (partidoId: string) => {
    if (editingScores[partidoId] !== undefined) {
      return editingScores[partidoId].totalGolesApuesta;
    }
    const apuesta = getApuestaForPartido(partidoId);
    return apuesta ? apuesta.totalGolesApuesta : null;
  };

  const submitApuesta = (partidoId: string) => {
    const gL = getEditingLocalScore(partidoId, 0);
    const gV = getEditingVisitanteScore(partidoId, 0);
    const ou = getEditingOverUnder(partidoId);
    onGuardarApuesta(partidoId, gL, gV, ou);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#034226', '#e1b12c', '#ffffff']
    });

    setNotifText('¡Apuesta guardada correctamente!');
    setTimeout(() => setNotifText(''), 4000);
  };

  // Triggering the scheduled Cloud Function simulation
  const runCloudFunctionSync = () => {
    // We update pending match with exciting scores!
    // Let's set Mexico vs Argentina to 3 - 1 (perfectly matches user's historical view)
    // and Brazil vs Switzerland to 1 - 0
    // and Spain vs Croatia to 2 - 0
    onSimularPartidos({
      "p2": { golesLocal: 3, golesVisitante: 1 }, // México 3 - 1 Argentina
      "p3": { golesLocal: 1, golesVisitante: 0 }, // Brasil 1 - 0 Suiza
      "p4": { golesLocal: 0, golesVisitante: 1 }  // España 0 - 1 Croacia
    });

    setNotifText('⚡ Cloud Function Ejecutada: Se consultaron resultados de la API y calcularon puntos.');
    setTimeout(() => setNotifText(''), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Simulation Console Card mimicking Cloud Function cron job */}
      {isAdmin && (
        <div className="bg-[#034226] border-2 border-[#e1b12c] rounded-2xl p-5 shadow-xl text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="font-mono text-[9px] text-[#034226] bg-[#e1b12c] px-2.5 py-1 rounded-full uppercase tracking-widest font-extrabold shadow-sm">
                Panel de Administrador
              </span>
              <h3 className="font-display text-xl text-white mt-2 tracking-wide uppercase">
                Obtener Resultados Reales
              </h3>
              <p className="font-sans text-xs text-slate-200 mt-1 leading-relaxed">
                Esta herramienta consulta los partidos finalizados y actualiza los puntajes.
              </p>
            </div>
            <button
              onClick={runCloudFunctionSync}
              className="bg-[#e1b12c] hover:bg-[#cda024] text-[#034226] font-sans font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap shadow-md self-stretch sm:self-auto justify-center"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">cloud_download</span>
              <span>ACTUALIZAR RESULTADOS (API)</span>
            </button>
          </div>
        </div>
      )}

      {notifText && (
        <div className="bg-[#034226] text-white border-2 border-[#e1b12c] p-3.5 rounded-xl text-center font-sans text-xs font-bold animate-pulse shadow-lg">
          {notifText}
        </div>
      )}

      {/* Bonificaciones Especiales (Global Picks) Card */}
      <div className="bg-white border-2 border-[#e1b12c]/40 rounded-2xl overflow-hidden shadow-sm">
        <button 
          onClick={() => setIsBonosExpanded(!isBonosExpanded)}
          className="w-full bg-gradient-to-r from-[#034226] to-[#045c36] py-3 px-5 flex justify-between items-center cursor-pointer hover:brightness-110 transition-all text-left"
        >
          <div>
            <h2 className="font-display text-xl text-[#e1b12c] flex items-center gap-2 tracking-wide uppercase">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              Pronósticos Globales
            </h2>
            <p className="text-white/80 font-sans text-xs mt-0.5">
              {!isBonosExpanded && !bonificaciones ? "Realiza tus apuestas aquí para recibir bonificaciones extra." : "Toca para expandir / contraer"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isBonosLocked && (
              <span className="material-symbols-outlined text-[#e1b12c]">lock</span>
            )}
            <span className={`material-symbols-outlined text-[#e1b12c] transition-transform duration-300 ${isBonosExpanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </div>
        </button>
        
        {isBonosExpanded && (
        <div className="p-5 space-y-5 animate-fade-in">
          <p className="text-slate-500 font-sans text-xs leading-relaxed font-medium">
            Selecciona a tus favoritos para ganar los puntos extra. {isBonosLocked ? "La etapa de edición ha finalizado." : "Asegúrate de guardar antes del inicio de Octavos."}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Campeón */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-sm text-[#e1b12c]">trophy</span>
                Campeón (+20 pts)
              </label>
              <select 
                disabled={isBonosLocked}
                value={editingBonos.campeon || ''}
                onChange={(e) => setEditingBonos({...editingBonos, campeon: e.target.value})}
                className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-sans text-slate-700 outline-none focus:ring-2 focus:ring-[#034226] disabled:opacity-60"
              >
                <option value="">-- Selecciona un País --</option>
                {equiposOrdenados.map(eq => <option key={eq} value={eq}>{eq}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 font-sans leading-tight">El equipo que levantará la copa al final.</p>
            </div>

            {/* Valla Invicta */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-sm text-[#034226]">shield</span>
                Valla Invicta (+10 pts)
              </label>
              <select 
                disabled={isBonosLocked}
                value={editingBonos.vallaInvicta || ''}
                onChange={(e) => setEditingBonos({...editingBonos, vallaInvicta: e.target.value})}
                className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-sans text-slate-700 outline-none focus:ring-2 focus:ring-[#034226] disabled:opacity-60"
              >
                <option value="">-- Selecciona un País --</option>
                {equiposOrdenados.map(eq => <option key={eq} value={eq}>{eq}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 font-sans leading-tight">El equipo que recibirá menos goles en total.</p>
            </div>

            {/* Fair Play */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-sm text-[#e1b12c]">style</span>
                Fair Play (+5 pts)
              </label>
              <select 
                disabled={isBonosLocked}
                value={editingBonos.fairPlay || ''}
                onChange={(e) => setEditingBonos({...editingBonos, fairPlay: e.target.value})}
                className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-sans text-slate-700 outline-none focus:ring-2 focus:ring-[#034226] disabled:opacity-60"
              >
                <option value="">-- Selecciona un País --</option>
                {equiposOrdenados.map(eq => <option key={eq} value={eq}>{eq}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 font-sans leading-tight">El equipo con menos tarjetas y mejor juego limpio.</p>
            </div>

            {/* Revelación */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-sm text-[#e1b12c]">stars</span>
                Revelación (+5 pts)
              </label>
              <select 
                disabled={isBonosLocked}
                value={editingBonos.revelacion || ''}
                onChange={(e) => setEditingBonos({...editingBonos, revelacion: e.target.value})}
                className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-sans text-slate-700 outline-none focus:ring-2 focus:ring-[#034226] disabled:opacity-60"
              >
                <option value="">-- Selecciona un País --</option>
                {equiposOrdenados.map(eq => <option key={eq} value={eq}>{eq}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 font-sans leading-tight">El equipo sorpresa oficial del torneo.</p>
            </div>

            {/* Goleador (Libre) */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-sm text-[#034226]">sports_and_outdoors</span>
                Goleador / Bota de Oro (+10 pts)
              </label>
              <input 
                type="text"
                disabled={isBonosLocked}
                placeholder="Ej. Lionel Messi, Mbappé..."
                value={editingBonos.goleador || ''}
                onChange={(e) => setEditingBonos({...editingBonos, goleador: e.target.value})}
                className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-sans text-slate-700 outline-none focus:ring-2 focus:ring-[#034226] disabled:opacity-60"
              />
              <p className="text-[10px] text-slate-400 font-sans leading-tight">Jugador que anotará la mayor cantidad de goles en el torneo.</p>
            </div>

          </div>

          {!isBonosLocked ? (
            <div className="w-full flex flex-col gap-1.5 items-center mt-2">
              <button
                onClick={handleSaveBonos}
                className={`w-full font-sans font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md ${
                  bonificaciones 
                    ? 'bg-slate-100 hover:bg-slate-200 text-[#034226] border border-slate-300' 
                    : 'bg-[#034226] hover:bg-[#02331d] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {bonificaciones ? 'edit' : 'save'}
                </span>
                <span className="uppercase">{bonificaciones ? 'ACTUALIZAR BONIFICACIONES' : 'GUARDAR BONIFICACIONES'}</span>
              </button>
              <p className="text-[10px] text-slate-400 font-sans font-semibold text-center uppercase tracking-wider">
                LÍMITE DE EDICIÓN: <span className="text-slate-500">27 DE JUNIO 2026 (INICIO FASE 2)</span>
              </p>
            </div>
          ) : (
            <div className="w-full flex items-center gap-2 text-slate-500 font-sans justify-center bg-slate-100 py-2.5 rounded-xl border border-slate-200/40 mt-2">
              <span className="material-symbols-outlined text-[16px] text-[#e1b12c] font-bold">lock</span>
              <span className="font-medium text-xs">
                Edición finalizada. Tus pronósticos globales están bloqueados.
              </span>
            </div>
          )}

        </div>
        )}
      </div>

      {/* Universal Search Filter and Calendar Toggle */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 relative">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400">search</span>
            </div>
            <input
              type="text"
              placeholder="Buscar equipo o grupo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#e1b12c]/30 focus:border-[#e1b12c] transition-all font-sans text-sm shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`w-14 shrink-0 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm ${showCalendar || selectedDate ? 'bg-[#034226] text-white border-[#034226]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            <span className="material-symbols-outlined text-[24px]">calendar_month</span>
          </button>
        </div>

        {/* Heatmap Calendar Ribbon */}
        {showCalendar && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-inner animate-in slide-in-from-top-2 fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 font-sans uppercase">Filtro por Fecha</span>
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold hover:bg-slate-200 transition-colors"
                >
                  MOSTRAR TODOS
                </button>
              )}
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x">
              {uniqueDates.map(date => {
                const count = dateCounts[date];
                // Intensidad de calor: 1-2 partidos = suave, 3 = medio, 4+ = intenso
                let intensityClass = 'bg-[#e1b12c]/20 text-slate-700';
                if (count === 3) intensityClass = 'bg-[#e1b12c]/60 text-slate-900 font-bold';
                if (count >= 4) intensityClass = 'bg-[#e1b12c] text-slate-900 font-extrabold';

                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(isSelected ? null : date)}
                    className={`snap-start shrink-0 flex flex-col items-center justify-center p-2 rounded-lg min-w-[70px] border-2 transition-all ${isSelected ? 'border-[#034226] shadow-md ring-2 ring-[#034226]/20' : 'border-transparent hover:border-slate-300'} ${intensityClass}`}
                  >
                    <span className="text-[10px] uppercase font-bold opacity-80">{date.split(' ')[0]}</span>
                    <span className="text-lg leading-none mt-1">{date.split(' ')[1].split('-')[0]}</span>
                    <span className="text-[9px] mt-1.5 opacity-80 font-bold bg-white/40 px-1 rounded-sm">{count} part.</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Tournament Phase Indicator */}
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs text-[#79ff5b] bg-[#79ff5b]/15 px-3.5 py-1.5 rounded-full border border-[#79ff5b]/30 uppercase tracking-widest font-bold">
          FASE DE GRUPOS
        </span>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
          <span className="font-sans text-xs text-red-600 font-bold tracking-widest">
            VIVO
          </span>
        </div>
      </div>

      {/* Group listings of matches by state and date */}
      {[
        { estadoKey: 'en_vivo', titulo: 'EN VIVO', colorCls: 'text-red-500 border-red-500 bg-red-500/10 flex gap-2 justify-center items-center', icon: true },
        { estadoKey: 'pendiente', titulo: 'PRÓXIMOS PARTIDOS', colorCls: 'text-[#e1b12c] border-[#e1b12c] bg-[#034226]', icon: false },
        { estadoKey: 'finalizado', titulo: 'FINALIZADOS', colorCls: 'text-slate-400 border-slate-600 bg-[#121316]', icon: false }
      ].map(({ estadoKey, titulo, colorCls, icon }) => {
        const fechasObj = partidosPorEstadoYFecha[estadoKey];
        if (!fechasObj || Object.keys(fechasObj).length === 0) return null;

        return (
          <div key={estadoKey} className="space-y-6 mt-8 first:mt-2">
            <div className={`py-3 px-4 rounded-xl shadow-md border ${colorCls}`}>
              {icon && <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>}
              <h2 className="font-display text-2xl uppercase tracking-widest text-center">
                {titulo}
              </h2>
            </div>

            {Object.entries(fechasObj).map(([fecha, partidosEstrella]) => (
              <section key={fecha} className="space-y-4">
                <div className="flex items-center gap-4 mt-6">
                  <h3 className="font-display text-3xl text-slate-200 uppercase tracking-wide leading-none">{fecha}</h3>
                  <div className="h-[1px] flex-grow bg-white/15"></div>
                </div>

                <div className="flex flex-col gap-4">
                  {partidosEstrella.map(match => {
              const apuesta = getApuestaForPartido(match.partidoId);
              let pointsEarned: number | null = null;
              if (match.estado === 'finalizado' && apuesta) {
                pointsEarned = typeof apuesta.puntosObtenidos === 'number' 
                  ? apuesta.puntosObtenidos 
                  : apuesta.puntosObtenidos.total;
              } else if (match.estado === 'finalizado') {
                pointsEarned = 0;
              }
              const yaBloqueado = match.estado === 'finalizado' || match.estado === 'en_vivo' || Date.now() >= match.fechaHoraInicio;

              return (
                <div 
                  key={match.partidoId}
                  className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                    yaBloqueado 
                      ? 'bg-slate-50 border-slate-200 opacity-90 shadow-sm' 
                      : 'bg-white border-2 border-[#034226]/15 hover:border-[#034226]/45 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="p-5">
                    {/* Header info */}
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                      <span className="font-sans text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {match.grupoTorneo} • {match.estadio}
                      </span>
                      <span className={`font-mono text-xs font-bold uppercase ${yaBloqueado ? 'text-slate-400' : 'text-[#034226]'}`}>
                        {match.estado === 'en_vivo' ? 'JUGÁNDOSE' : match.estado === 'finalizado' ? 'FINALIZADO' : match.hora}
                      </span>
                    </div>

                    {/* Team flags and prediction scores block */}
                    <div className="grid grid-cols-3 items-center gap-1 sm:gap-4 mb-3">
                      
                      {/* Local Team */}
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-16 h-10 rounded overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm relative group">
                          <img 
                            alt={match.equipoLocal} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            src={match.banderaLocal} 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-display text-lg text-slate-700 tracking-wider truncate max-w-[124px]">
                          {match.equipoLocal}
                        </span>
                        
                        {/* Interactive Prediction Controls */}
                        {!yaBloqueado && (
                          <div className="flex items-center gap-2 mt-1 bg-slate-50 border border-slate-200/80 rounded-full px-2 py-1">
                            <button
                              onClick={() => setLocalScore(match.partidoId, getEditingLocalScore(match.partidoId, 0) - 1)}
                              className="w-8 h-8 rounded-full bg-white hover:bg-[#034226] hover:text-white text-slate-600 flex items-center justify-center cursor-pointer transition-colors active:scale-95 border border-slate-200 shadow-sm"
                              aria-label="Disminuir goles local"
                            >
                              <span className="material-symbols-outlined text-xs font-bold">remove</span>
                            </button>
                            <span className="font-display text-2xl text-[#034226] w-6 text-center font-bold">
                              {getEditingLocalScore(match.partidoId, 0)}
                            </span>
                            <button
                              onClick={() => setLocalScore(match.partidoId, getEditingLocalScore(match.partidoId, 0) + 1)}
                              className="w-8 h-8 rounded-full bg-white hover:bg-[#034226] hover:text-white text-slate-600 flex items-center justify-center cursor-pointer transition-colors active:scale-95 border border-slate-200 shadow-sm"
                              aria-label="Aumentar goles local"
                            >
                              <span className="material-symbols-outlined text-xs font-bold">add</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* VS Divider or Real Final scores */}
                      <div className="flex flex-col items-center justify-center px-1 flex-shrink-0">
                        {match.estado === 'finalizado' ? (
                          <div className="flex flex-col items-center bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
                            <span className="font-sans text-[8px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Real</span>
                            <div className="flex items-center gap-2">
                              <span className="font-display text-3xl text-[#034226] font-black">
                                {match.golesLocal}
                              </span>
                              <span className="font-mono text-xs text-slate-400">-</span>
                              <span className="font-display text-3xl text-[#034226] font-black">
                                {match.golesVisitante}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-400 border border-slate-200 shadow-inner">
                            VS
                          </div>
                        )}
                      </div>

                      {/* Visitant Team */}
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-16 h-10 rounded overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm relative group">
                          <img 
                            alt={match.equipoVisitante} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            src={match.banderaVisitante} 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-display text-lg text-slate-700 tracking-wider truncate max-w-[124px]">
                          {match.equipoVisitante}
                        </span>

                        {!yaBloqueado && (
                          <div className="flex items-center gap-2 mt-1 bg-slate-50 border border-slate-200/80 rounded-full px-2 py-1">
                            <button
                              onClick={() => setVisitanteScore(match.partidoId, getEditingVisitanteScore(match.partidoId, 0) - 1)}
                              className="w-8 h-8 rounded-full bg-white hover:bg-[#034226] hover:text-white text-slate-600 flex items-center justify-center cursor-pointer transition-colors active:scale-95 border border-slate-200 shadow-sm"
                              aria-label="Disminuir goles visitante"
                            >
                              <span className="material-symbols-outlined text-xs font-bold">remove</span>
                            </button>
                            <span className="font-display text-2xl text-[#034226] w-6 text-center font-bold">
                              {getEditingVisitanteScore(match.partidoId, 0)}
                            </span>
                            <button
                              onClick={() => setVisitanteScore(match.partidoId, getEditingVisitanteScore(match.partidoId, 0) + 1)}
                              className="w-8 h-8 rounded-full bg-white hover:bg-[#034226] hover:text-white text-slate-600 flex items-center justify-center cursor-pointer transition-colors active:scale-95 border border-slate-200 shadow-sm"
                              aria-label="Aumentar goles visitante"
                            >
                              <span className="material-symbols-outlined text-xs font-bold">add</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Footer Lock state/Prediction notification message */}
                    <div className="mt-4 pt-3 border-t border-slate-150 flex flex-col items-center justify-between text-xs text-slate-600">
                      {yaBloqueado ? (() => {
                        const ptsObj = apuesta && typeof apuesta.puntosObtenidos === 'object' && apuesta.puntosObtenidos !== null 
                                       ? apuesta.puntosObtenidos : null;
                        return (
                        <div className="w-full flex flex-col gap-2">
                          <div className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 rounded-xl border border-slate-200/40">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px] text-[#e1b12c] font-bold">lock</span>
                              <span className="font-medium text-xs">
                                {apuesta 
                                  ? `Tu Pronóstico: ${apuesta.golesLocalApuesta} - ${apuesta.golesVisitanteApuesta}` 
                                  : 'Sin predicción'}
                              </span>
                              {apuesta?.totalGolesApuesta && (
                                <span className="bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold text-[10px] ml-1">
                                  {apuesta.totalGolesApuesta === 'mas25' ? '+2.5 Goles' : '-2.5 Goles'}
                                </span>
                              )}
                            </div>
                            {match.estado === 'finalizado' && pointsEarned !== null && !ptsObj && (
                              <span className="bg-[#e1b12c]/20 text-[#034226] px-2 py-1 rounded font-bold text-[10px] uppercase border border-[#e1b12c]/40">
                                +{pointsEarned} pts obtenidos
                              </span>
                            )}
                          </div>
                          
                          {/* Breakdown UI */}
                          {match.estado === 'finalizado' && ptsObj && (
                            <div className="bg-[#034226]/5 rounded-xl border border-[#034226]/10 p-3 mx-1 flex flex-col gap-1.5 text-[11px]">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Desglose de puntos</div>
                              
                              {ptsObj.marcador > 0 && <div className="flex justify-between items-center text-slate-600"><span>Marcador Exacto:</span> <span className="font-bold bg-white px-2 py-0.5 rounded border border-slate-200">+{ptsObj.marcador} pts</span></div>}
                              
                              {ptsObj.ganador > 0 && <div className="flex justify-between items-center text-slate-600"><span>Equipo Ganador:</span> <span className="font-bold bg-white px-2 py-0.5 rounded border border-slate-200">+{ptsObj.ganador} pts</span></div>}
                              
                              {ptsObj.empate > 0 && <div className="flex justify-between items-center text-slate-600"><span>Empate Acertado:</span> <span className="font-bold bg-white px-2 py-0.5 rounded border border-slate-200">+{ptsObj.empate} pts</span></div>}
                              
                              {ptsObj.totalGoles > 0 && <div className="flex justify-between items-center text-slate-600"><span>Opcional ({apuesta.totalGolesApuesta === 'mas25' ? '+2.5' : '-2.5'} Goles):</span> <span className="font-bold bg-white px-2 py-0.5 rounded border border-slate-200">+{ptsObj.totalGoles} pts</span></div>}
                              
                              <div className="flex justify-between items-center border-t border-[#034226]/10 pt-2 mt-1 font-black text-[#034226] text-xs">
                                <span className="uppercase tracking-wider">Puntos Obtenidos:</span> <span className="bg-[#e1b12c]/20 px-2.5 py-1 rounded-md border border-[#e1b12c]/40">+{ptsObj.total} pts</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )})() : (
                        <div className="w-full flex flex-col gap-3 items-center">
                          {/* Over/Under Selection */}
                          <div className="flex w-full items-center gap-2 mb-1 justify-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Opcional:</span>
                            <button
                              onClick={() => setOverUnderScore(match.partidoId, getEditingOverUnder(match.partidoId) === 'mas25' ? null : 'mas25')}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors ${
                                getEditingOverUnder(match.partidoId) === 'mas25' 
                                  ? 'bg-[#034226] text-white border-[#034226]' 
                                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              +2.5 Goles
                            </button>
                            <button
                              onClick={() => setOverUnderScore(match.partidoId, getEditingOverUnder(match.partidoId) === 'menos25' ? null : 'menos25')}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors ${
                                getEditingOverUnder(match.partidoId) === 'menos25' 
                                  ? 'bg-[#e1b12c] text-[#034226] border-[#e1b12c]' 
                                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              -2.5 Goles
                            </button>
                          </div>

                          <button
                            onClick={() => submitApuesta(match.partidoId)}
                            className={`w-full font-sans font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md ${
                              apuesta 
                                ? 'bg-slate-100 hover:bg-slate-200 text-[#034226] border border-slate-300' 
                                : 'bg-[#034226] hover:bg-[#02331d] text-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {apuesta ? 'edit' : 'save'}
                            </span>
                            <span className="uppercase">{apuesta ? 'ACTUALIZAR APUESTA' : 'GUARDAR APUESTA'}</span>
                          </button>
                          <p className="text-[10px] text-slate-400 font-sans font-semibold text-center uppercase tracking-wider">
                            LÍMITE DE EDICIÓN: <span className="text-slate-500">{match.fecha} a las {match.hora}</span>
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </section>
        ))}
      </div>
      );
    })}

    </div>
  );
}
