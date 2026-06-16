import React, { useState, useEffect } from 'react';
import { Usuario, Partido, Apuesta } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface RankingTabProps {
  usuarios: (Usuario & { posicion: number })[];
  apuestas: Apuesta[];
  partidos: Partido[];
  usuarioActualId: string;
  activeGrupo?: string;
}

export default function RankingTab({ usuarios, apuestas, partidos, usuarioActualId, activeGrupo }: RankingTabProps) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userBets, setUserBets] = useState<Apuesta[]>([]);
  const [loadingBets, setLoadingBets] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Extract dates for calendar
  const dateCounts: Record<string, number> = {};
  partidos.forEach(p => {
    dateCounts[p.fecha] = (dateCounts[p.fecha] || 0) + 1;
  });
  const uniqueDates = Object.keys(dateCounts).sort();

  const handleUserClick = async (uid: string) => {
    if (expandedUserId === uid) {
      setExpandedUserId(null);
      return;
    }
    
    setExpandedUserId(uid);
    setLoadingBets(true);
    
    try {
      const q = query(
        collection(db, 'pm_apuestas'), 
        where('uid', '==', uid),
        where('codigoGrupo', '==', activeGrupo || 'LACURVA1')
      );
      
      // Timeout de 8 segundos para evitar cargas infinitas si la red falla
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));
      const snap = await Promise.race([getDocs(q), timeoutPromise]) as any;
      
      const bets: Apuesta[] = [];
      snap.forEach((doc: any) => bets.push(doc.data() as Apuesta));
      setUserBets(bets);
    } catch (e: any) {
      console.error("Error cargando apuestas del usuario", e);
      if (e.message === 'TIMEOUT') {
         console.warn("La carga de apuestas tardó demasiado. Posible problema de conexión.");
      }
    } finally {
      setLoadingBets(false);
    }
  };

  const getApuestaForPartido = (partidoId: string) => {
    return userBets.find(a => a.partidoId === partidoId);
  };

  const now = Date.now();
  const TRES_HORAS = 3 * 60 * 60 * 1000;
  const partidosComputados = partidos.map(p => {
    let computedEstado = p.estado;
    if (computedEstado === 'pendiente' && p.fechaHoraInicio <= now) {
      if (now - p.fechaHoraInicio >= TRES_HORAS) {
        computedEstado = 'finalizado';
      } else {
        computedEstado = 'en_vivo';
      }
    }
    return { ...p, estado: computedEstado };
  });

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
    const order: Record<string, number> = {
      'finalizado': 1,
      'en_vivo': 2,
      'pendiente': 3
    };
    if (order[a.estado] !== order[b.estado]) {
      return order[a.estado] - order[b.estado];
    }
    // Dentro del mismo estado, los finalizados los mostramos del más reciente al más antiguo
    if (a.estado === 'finalizado') {
      return b.fechaHoraInicio - a.fechaHoraInicio;
    }
    // Pendientes y en vivo en orden cronológico normal
    return a.fechaHoraInicio - b.fechaHoraInicio;
  });

  return (
    <div className="p-4 sm:p-6 pb-32 max-w-4xl mx-auto font-sans animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-2xl p-6 premium-card border shadow-xl group mb-6">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-8xl theme-text-card">leaderboard</span>
        </div>
        
        <h2 className="font-display text-3xl premium-card-title mb-2 flex items-center gap-2 uppercase tracking-wide relative z-10">
          <span className="material-symbols-outlined text-[24px]">leaderboard</span>
          Ranking Total
        </h2>
        <p className="opacity-80 font-sans text-sm relative z-10">Posiciones y predicciones del grupo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {usuarios.map(user => {
          const isExpanded = expandedUserId === user.uid;
          const isCurrentUser = user.uid === usuarioActualId;

          return (
            <div key={user.uid} className={`theme-card border ${isCurrentUser ? 'border-[#e1b12c]' : ''} rounded-2xl overflow-hidden shadow-xl transition-all duration-300`}>
              {/* User row header */}
              <div 
                onClick={() => handleUserClick(user.uid)}
                className={`flex items-center gap-4 p-4 cursor-pointer hover:theme-subcard transition-colors ${isExpanded ? 'theme-card/5' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${user.posicion === 1 ? 'bg-[#e1b12c] text-[#121316]' : user.posicion === 2 ? 'bg-[#94a3b8] text-[#121316]' : user.posicion === 3 ? 'bg-[#b45309] theme-text-card' : 'bg-slate-100 theme-text-muted'}`}>
                  {user.posicion}
                </div>
                
                {user.foto ? (
                  <img src={user.foto} alt={user.nombre} className="w-12 h-12 rounded-full object-cover border-2 " />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 ">
                    <span className="material-symbols-outlined theme-text-muted">person</span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold theme-text-card text-base truncate flex items-center gap-2">
                    {user.nombre}
                    {isCurrentUser && <span className="text-[10px] bg-[#e1b12c] text-black px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Tú</span>}
                  </h3>
                  <p className="text-xs theme-text-muted mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">visibility</span> Ver apuestas
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold text-[#e1b12c]">{user.puntosTotal}</p>
                  <p className="text-[10px] uppercase tracking-wider theme-text-muted font-bold">Puntos</p>
                </div>
              </div>

              {/* Expanded Bets View */}
              {isExpanded && (
                <div className="border-t border-slate-100 theme-subcard p-4">
                  {/* Search & Calendar Tools */}
                  <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted">search</span>
                      <input 
                        type="text" 
                        placeholder="Buscar equipo o fecha..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full theme-card border  theme-text-card rounded-xl pl-10 pr-4 py-2.5 font-sans focus:outline-none focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/50 transition-all text-sm placeholder:theme-text-muted"
                      />
                    </div>
                    <button 
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={`h-11 px-4 rounded-xl font-bold flex items-center gap-2 transition-colors border ${selectedDate || showCalendar ? 'bg-[#e1b12c] text-[#121316] border-[#e1b12c]' : 'theme-card theme-text-card  hover:border-white/30'}`}
                    >
                      <span className="material-symbols-outlined">calendar_month</span>
                    </button>
                    {(selectedDate || searchTerm) && (
                      <button 
                        onClick={() => { setSelectedDate(null); setSearchTerm(''); }}
                        className="h-11 px-4 rounded-xl font-bold flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    )}
                  </div>

                  {/* Calendar view */}
                  {showCalendar && (
                    <div className="mb-6 theme-card p-4 rounded-xl border  shadow-inner">
                      <h3 className="theme-text-card text-sm font-bold mb-3 font-sans uppercase tracking-wider">Fechas de Partidos</h3>
                      <div className="flex flex-wrap gap-2">
                        {uniqueDates.map(date => (
                          <button
                            key={date}
                            onClick={() => {
                              setSelectedDate(date === selectedDate ? null : date);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                              date === selectedDate 
                                ? 'bg-[#e1b12c] text-[#121316] border-[#e1b12c] scale-105' 
                                : 'theme-card theme-text-card  hover:border-white/30'
                            }`}
                          >
                            {date}
                            <span className="ml-1.5 opacity-50 font-sans text-[10px] px-1 bg-black/20 rounded-full">{dateCounts[date]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {loadingBets ? (
                    <div className="flex justify-center p-8">
                      <div className="w-8 h-8 border-4 border-green-200 border-t-[#00ff88] rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      {filteredPartidos.map(partido => {
                        const apuesta = getApuestaForPartido(partido.partidoId);
                        
                        // Privacidad: solo mostrar apuestas si es "en_vivo" o "finalizado", a menos que sea el usuario actual
                        const isSecret = partido.estado === 'pendiente' && !isCurrentUser;

                        return (
                          <div key={partido.partidoId} className="theme-card border  rounded-xl p-3 sm:p-4 shadow flex flex-col gap-3">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-[10px] font-bold theme-text-muted uppercase tracking-widest">{partido.grupoTorneo}</span>
                              <span className="text-xs theme-text-muted">{partido.fecha} - {partido.hora}</span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-2 sm:gap-4">
                              <div className="flex-1 flex flex-col items-center gap-2">
                                <img src={partido.banderaLocal} alt={partido.equipoLocal} className="w-10 h-7 sm:w-12 sm:h-8 object-cover rounded border  shadow-sm" />
                                <span className="text-xs sm:text-sm font-bold theme-text-card text-center leading-tight">{partido.equipoLocal}</span>
                              </div>
                              
                              <div className="flex-1 flex flex-col items-center">
                                {isSecret ? (
                                  <div className="flex flex-col items-center mb-1">
                                    <span className="text-[10px] font-bold theme-text-muted tracking-wider mb-0.5 opacity-0">PRONÓSTICO</span>
                                    <div className="theme-card border  rounded-lg px-4 py-2 flex items-center justify-center">
                                      <span className="material-symbols-outlined theme-text-muted">lock</span>
                                    </div>
                                  </div>
                                ) : apuesta ? (
                                  <div className="flex flex-col items-center mb-1">
                                    <span className="text-[10px] font-bold theme-text-muted tracking-wider mb-0.5 uppercase">Pronóstico</span>
                                    <div className="theme-card border border-[#e1b12c]/30 rounded-lg px-3 sm:px-5 py-1.5 flex items-center justify-center gap-2 sm:gap-4 shadow-inner">
                                      <span className="font-mono text-xl sm:text-2xl font-bold theme-text-card">{apuesta.golesLocalApuesta}</span>
                                      <span className="theme-text-muted">-</span>
                                      <span className="font-mono text-xl sm:text-2xl font-bold theme-text-card">{apuesta.golesVisitanteApuesta}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center mb-1">
                                    <span className="text-[10px] font-bold theme-text-muted tracking-wider mb-0.5 opacity-0">PRONÓSTICO</span>
                                    <div className="theme-card border border-red-500/20 rounded-lg px-3 py-1 flex items-center justify-center">
                                      <span className="text-xs text-red-400">Sin predicción</span>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Estado del partido o resultado real */}
                                {partido.estado === 'finalizado' && partido.golesLocal !== null && partido.golesVisitante !== null ? (
                                  <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold border border-green-200 whitespace-nowrap">
                                    Real: {partido.golesLocal} - {partido.golesVisitante}
                                  </span>
                                ) : partido.estado === 'en_vivo' && partido.golesLocal !== null && partido.golesVisitante !== null ? (
                                  <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded font-bold border border-red-400/20 animate-pulse whitespace-nowrap">
                                    En Vivo: {partido.golesLocal} - {partido.golesVisitante}
                                  </span>
                                ) : (
                                  <span className="text-[10px] theme-text-muted font-mono tracking-wider">VS</span>
                                )}
                              </div>
                              
                              <div className="flex-1 flex flex-col items-center gap-2">
                                <img src={partido.banderaVisitante} alt={partido.equipoVisitante} className="w-10 h-7 sm:w-12 sm:h-8 object-cover rounded border  shadow-sm" />
                                <span className="text-xs sm:text-sm font-bold theme-text-card text-center leading-tight">{partido.equipoVisitante}</span>
                              </div>
                            </div>

                            {/* Puntaje info si finalizó */}
                            {partido.estado === 'finalizado' && partido.golesLocal !== null && apuesta && (
                              <div className="mt-3">
                                {typeof apuesta.puntosObtenidos === 'object' && apuesta.puntosObtenidos !== null ? (
                                  <div className="theme-card rounded-xl p-3 border border-[#e1b12c]/20">
                                    <p className="text-[10px] font-bold theme-text-muted uppercase tracking-widest mb-2">Desglose de Puntos</p>
                                    <div className="space-y-1 text-[11px] font-sans">
                                      {apuesta.puntosObtenidos.marcador > 0 && <div className="flex justify-between items-center theme-text-card"><span>Marcador Exacto:</span> <span className="font-bold text-green-600">+{apuesta.puntosObtenidos.marcador} pts</span></div>}
                                      {apuesta.puntosObtenidos.ganador > 0 && <div className="flex justify-between items-center theme-text-card"><span>{apuesta.puntosObtenidos.ganador === 3 ? 'Ganador + Goles:' : 'Equipo Ganador:'}</span> <span className="font-bold text-green-600">+{apuesta.puntosObtenidos.ganador} pts</span></div>}
                                      {apuesta.puntosObtenidos.empate > 0 && <div className="flex justify-between items-center theme-text-card"><span>Empate Acertado:</span> <span className="font-bold text-green-600">+{apuesta.puntosObtenidos.empate} pts</span></div>}
                                      {apuesta.puntosObtenidos.totalGoles > 0 && <div className="flex justify-between items-center theme-text-card"><span>Opcional ({apuesta.totalGolesApuesta === 'mas25' ? '+2.5' : '-2.5'} Goles):</span> <span className="font-bold text-green-600">+{apuesta.puntosObtenidos.totalGoles} pts</span></div>}
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                      <span className="text-[11px] font-bold text-[#e1b12c] uppercase">Puntos Obtenidos:</span>
                                      <span className="font-bold font-mono text-[#e1b12c] text-xs">+{apuesta.puntosObtenidos.total} pts</span>
                                    </div>
                                  </div>
                                ) : typeof apuesta.puntosObtenidos === 'number' ? (
                                  <div className="flex justify-center">
                                    <span className="bg-[#e1b12c]/10 text-[#e1b12c] text-[10px] px-2 py-1 rounded-md font-bold font-mono border border-[#e1b12c]/20">
                                      +{apuesta.puntosObtenidos} pts en este partido
                                    </span>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {filteredPartidos.length === 0 && (
                        <p className="text-center theme-text-muted py-8">No se encontraron partidos</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
