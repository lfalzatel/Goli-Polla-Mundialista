/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RankedUser, Apuesta, Partido } from '../types';
import { PARTIDOS_INICIALES } from '../data';
import { db } from '../lib/firebase';
import { doc, writeBatch, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

interface PerfilTabProps {
  nombre: string;
  foto: string;
  email: string;
  whatsapp: string;
  codigoGrupo: string;
  grupoNombre?: string;
  puntosTotal: number;
  rankingLideres: RankedUser[];
  apuestas: Apuesta[];
  partidos: Partido[];
  onUpdateWhatsapp: (newPhone: string) => void;
}

export default function PerfilTab({
  nombre,
  foto,
  email,
  whatsapp,
  codigoGrupo,
  grupoNombre,
  puntosTotal,
  rankingLideres,
  apuestas,
  partidos,
  onUpdateWhatsapp
}: PerfilTabProps) {
  const [phoneNumber, setPhoneNumber] = useState(whatsapp);
  const [isEditing, setIsEditing] = useState(false);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [groupCreateMsg, setGroupCreateMsg] = useState('');
  const [misGrupos, setMisGrupos] = useState<any[]>([]);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (email !== 'lfalzatel@gmail.com') return;
    const q = query(collection(db, 'pm_grupos'), where("creadoPor", "==", email));
    const unsub = onSnapshot(q, (snapshot) => {
      const g: any[] = [];
      snapshot.forEach(doc => g.push({ id: doc.id, ...doc.data() }));
      setMisGrupos(g);
    });
    return () => unsub();
  }, [email]);

  useEffect(() => {
    setPhoneNumber(whatsapp);
  }, [whatsapp]);

  // Sorting leaderboard users so they match positions perfectly
  const sortedRanking = [...rankingLideres].sort((a, b) => {
    return a.posicion - b.posicion;
  });

  // Decide which users to show
  const visibleRanking = showAllLeaderboard ? sortedRanking : sortedRanking.slice(0, 4);

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    onUpdateWhatsapp(phoneNumber);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSeedPartidos = async () => {
    if (!window.confirm("¿Seguro que deseas reiniciar y poblar la base de datos de partidos? Esto sobreescribirá los partidos existentes.")) return;
    try {
      const batch = writeBatch(db);
      PARTIDOS_INICIALES.forEach(partido => {
        const docRef = doc(db, 'pm_partidos', partido.partidoId);
        batch.set(docRef, partido);
      });
      await batch.commit();
      alert("Partidos inicializados exitosamente en Firestore.");
    } catch (e) {
      console.error("Error inicializando partidos", e);
      alert("Hubo un error inicializando los partidos.");
    }
  };

  // Build the real history from finished matches that the user bet on
  const historialApuestas = apuestas
    .map(ap => {
      const p = partidos.find(match => match.partidoId === ap.partidoId);
      return { apuesta: ap, partido: p };
    })
    .filter(item => item.partido && item.partido.estado === 'finalizado')
    .map(item => {
      const ap = item.apuesta;
      const p = item.partido!;
      
      const pts = typeof ap.puntosObtenidos === 'number' ? ap.puntosObtenidos : ap.puntosObtenidos.total;
      
      let tipo = "SIN ACIERTOS";
      let badgeColor = "bg-red-100 text-red-700";
      let icon = "cancel";
      
      if (pts === 5) {
        tipo = "MARCADOR EXACTO";
        badgeColor = "bg-green-100 text-green-700";
        icon = "star";
      } else if (pts > 0) {
        tipo = "ACIERTOS PARCIALES";
        badgeColor = "bg-amber-100 text-amber-700";
        icon = "check_circle";
      }

      return {
        fase: `${p.fase.toUpperCase()} • ${p.fecha.split(' ')[1]}`,
        tipo,
        puntosLabel: `${pts} PUNTOS`,
        puntosColor: pts > 0 ? (pts === 5 ? "text-green-700 bg-green-50 border-green-200" : "text-amber-700 bg-amber-50 border-amber-200") : "text-red-700 bg-red-50 border-red-200",
        colorLeft: pts > 0 ? (pts === 5 ? "border-green-600" : "border-amber-500") : "border-red-500",
        local: p.equipoLocal.substring(0, 3).toUpperCase(),
        visitante: p.equipoVisitante.substring(0, 3).toUpperCase(),
        golesLocApuesta: ap.golesLocalApuesta,
        golesVisApuesta: ap.golesVisitanteApuesta,
        golesLocReal: p.golesLocal,
        golesVisReal: p.golesVisitante,
        badgeColor,
        icon,
        banderaLoc: p.banderaLocal,
        banderaVis: p.banderaVisitante
      };
    });

  const handleCreateGroup = async () => {
    if (!newGroupCode.trim() || !newGroupName.trim()) {
      setGroupCreateMsg("Por favor, llena ambos campos.");
      return;
    }
    try {
      const codigoStr = newGroupCode.trim().toUpperCase();
      const docRef = doc(db, 'pm_grupos', codigoStr);
      await setDoc(docRef, {
        codigo: codigoStr,
        nombre: newGroupName,
        creadoPor: email,
        activo: true,
        createdAt: new Date().toISOString()
      });
      setGroupCreateMsg(`¡Grupo ${codigoStr} creado exitosamente!`);
      setNewGroupName('');
      setNewGroupCode('');
      setTimeout(() => setGroupCreateMsg(''), 4000);
    } catch (e) {
      console.error(e);
      setGroupCreateMsg("Error creando grupo.");
    }
  };

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Goli Polla Mundialista',
        text: '¡Únete a mi grupo en la Polla Mundialista y demuestra que sabes de fútbol!',
        url: window.location.href, // Aquí irá el enlace real después
      }).catch(console.error);
    } else {
      alert("La función de compartir no está disponible en este navegador.");
    }
  };

  const handleCopyCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiedCode(codigo);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Profile Hero Enclosure */}
      <section className="relative overflow-hidden theme-card border  rounded-2xl p-6 shadow-sm">
        
        {/* Glow vector back */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#034226]/5 blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar and metadata info */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-full border-4 border-[#034226] p-1 shadow-md bg-slate-50">
                <img 
                  alt={nombre} 
                  className="w-full h-full rounded-full object-cover" 
                  src={foto || "https://lh3.googleusercontent.com/aida-public/AB6AXuB51HhLfnZaDiGtKYp7MwISidlkzLIvjuKRkqP-Z4Ht2dfgJK3G8Ve2q4QdXolTh7pung4KkLRXjVW-wEb_4UESxWciOP6HrVq2_JhM1XYhDssQTl7p5-ey-rgv2tfQCzfManWqd5WgZ8rShV-0IJFalxgyqdM5DuGNi-aMWPgI2fDBTcvn1bDgPNRX6YlC9MMlGEC_qv3OozOdRzTAWf5n3njxyzJz_10pMEEW1tGZ9t6OAaoy2zhSTVl1dQ10KnYavNUUhU2_0RU"}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#e1b12c] text-[#034226] px-2 py-0.5 rounded-full font-sans font-bold text-[9px] uppercase shadow-md">
                PRO
              </div>
            </div>
            
            <div className="space-y-1">
              <h2 className="font-display text-2xl theme-text-card tracking-wide leading-none">{nombre}</h2>
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="material-symbols-outlined text-[16px] text-[#e1b12c]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span className="font-sans text-xs font-bold uppercase tracking-wider">
                  Ranking Global: #14
                </span>
              </div>
              <p className="font-sans text-xs text-slate-400 font-semibold uppercase">Grupo Activo: {grupoNombre || codigoGrupo}</p>
            </div>
          </div>

          {/* Points Enclosure counter panel */}
          <div className="flex flex-col items-center justify-center bg-[#034226] px-5 py-4 rounded-2xl border-2 border-[#e1b12c] min-w-[140px] shadow-sm text-center">
            <span className="font-sans text-[10px] text-[#e1b12c] uppercase tracking-widest font-extrabold">Total Puntos</span>
            <span className="font-display text-4xl text-white leading-tight font-black">{puntosTotal}</span>
          </div>

        </div>

        {/* Editable Contacts fields */}
        <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 border-t border-slate-100">
          <form onSubmit={handleSavePhone} className="space-y-1.5">
            <label className="font-sans text-xs text-slate-500 font-bold block ml-1 uppercase">
              WhatsApp de Contacto
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-[#034226] font-bold">
                call
              </span>
              
              <input
                className="w-full theme-card border border-[#034226]/50 rounded-full py-3 pl-12 pr-12 theme-text-card font-sans text-sm focus:ring-2 focus:ring-[#034226] focus:border-transparent transition-all outline-none"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Tu número"
              />

              <button
                type="submit"
                className="absolute right-3 text-[#e1b12c] hover:bg-[#e1b12c]/10 p-1.5 rounded-full transition-all cursor-pointer"
                title="Guardar WhatsApp"
                aria-label="Guardar"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check
                </span>
              </button>
            </div>

            {saveSuccess && (
              <p className="text-[#034226] text-xs font-bold px-2">
                ¡Número de contacto actualizado correctamente!
              </p>
            )}
          </form>
        </div>

        {/* Action Buttons for App */}
        <div className="relative z-10 mt-5 flex gap-3">
          <button 
            onClick={() => setShowInstallModal(true)}
            className="flex-1 bg-[#034226] text-white py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#02331d] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Instalar App
          </button>
          <button 
            onClick={handleShareApp}
            className="flex-1 bg-[#e1b12c] text-[#034226] py-2.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#cda023] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            Compartir App
          </button>
        </div>
      </section>

      {/* Leaderboard standing block */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display text-2xl text-[#e1b12c] flex items-center gap-2 uppercase tracking-wide">
            <span className="material-symbols-outlined text-[#e1b12c]" style={{ fontVariationSettings: "'FILL' 1" }}>
              leaderboard
            </span>
            Ranking del Grupo
          </h3>
          <button
            onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
            className="font-sans text-xs text-[#79ff5b] flex items-center gap-1 hover:underline cursor-pointer tracking-wider font-extrabold"
          >
            {showAllLeaderboard ? 'Ver Menos' : 'Ver Todos'} 
            <span className="material-symbols-outlined text-[16px]">{showAllLeaderboard ? 'expand_less' : 'chevron_right'}</span>
          </button>
        </div>

        <div className="theme-card border  rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
          {visibleRanking.map(user => {
            const isSelf = user.uid === 'me';
            
            // Format first place crown etc.
            return (
              <div
                key={user.uid}
                className={`flex items-center justify-between p-4 transition-all ${
                  isSelf 
                    ? 'bg-[#034226]/5 border-l-4 border-[#034226] relative' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Position indicator */}
                  {user.posicion === 1 ? (
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e1b12c] text-[#034226] font-display text-lg font-black">
                      1
                    </div>
                  ) : user.posicion === 2 ? (
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-300 theme-text-card font-display text-lg font-black">
                      2
                    </div>
                  ) : user.posicion === 3 ? (
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 text-amber-800 font-display text-lg font-black">
                      3
                    </div>
                  ) : (
                    <span className="font-display text-lg text-slate-500 w-8 text-center font-bold">{user.posicion}</span>
                  )}

                  {/* Avatar thumbnail */}
                  <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border ${isSelf ? 'border-[#034226] border-2' : ''}`}>
                    <img 
                      alt={user.nombre} 
                      className="w-full h-full object-cover" 
                      src={user.foto} 
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div>
                    <span className={`font-sans text-sm font-bold block ${isSelf ? 'text-[#034226]' : 'theme-text-card'}`}>
                      {user.nombre} {isSelf && '(Tú)'}
                    </span>
                    <span className="font-sans text-[10px] text-slate-500 font-semibold leading-none">
                      {user.isMe ? 'Subiendo 2 puestos' : user.tendencia === 'subiendo' ? '▲ Subiendo' : user.tendencia === 'bajando' ? '▼ Bajando' : ' Estable'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display text-2xl text-[#034226] font-black block leading-none">{user.puntosTotal}</span>
                  <span className="block font-sans text-[8px] text-slate-400 tracking-widest font-bold uppercase mt-0.5">PTS</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bets Breakdowns historic details */}
      <section className="space-y-4 pb-10">
        <h3 className="font-display text-2xl text-[#79ff5b] flex items-center gap-2 uppercase tracking-wide px-1">
          <span className="material-symbols-outlined text-[#79ff5b]">history</span>
          Desglose de Apuestas
        </h3>

        <div className="space-y-4">
          {historialApuestas.length === 0 ? (
            <div className="theme-card rounded-2xl p-6 text-center text-slate-500 border  shadow-sm text-sm">
              No tienes partidos finalizados con apuestas registradas aún.
            </div>
          ) : historialApuestas.map((item, idx) => {
            return (
              <div 
                key={idx}
                className={`theme-card rounded-2xl p-5 flex flex-col gap-4 border  border-l-4 border-solid ${item.colorLeft} shadow-sm`}
              >
                
                {/* Header row */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-sans text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.fase}</span>
                  <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-sans text-[10px] font-extrabold tracking-wide uppercase ${item.badgeColor}`}>
                    <span className="material-symbols-outlined text-[13px] font-bold">
                      {item.icon}
                    </span>
                    <span>{item.tipo}</span>
                  </div>
                </div>

                {/* Score panel rows */}
                <div className="grid grid-cols-3 items-center text-center">
                  
                  {/* Local Flag info */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-8 rounded overflow-hidden bg-slate-50 flex items-center justify-center border  shadow-sm">
                      <img 
                        alt={item.local} 
                        className="w-full h-full object-cover" 
                        src={item.banderaLoc} 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="font-sans text-xs font-bold text-slate-700">{item.local}</span>
                  </div>

                  {/* Bet vs Real scores detail */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <span className="font-sans text-[8px] text-slate-400 font-bold uppercase">Tu Polla</span>
                        <span className="font-display text-xl text-[#034226] font-bold">{item.golesLocApuesta} - {item.golesVisApuesta}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
                      <div className="flex flex-col items-center">
                        <span className="font-sans text-[8px] text-slate-400 font-bold uppercase">Real</span>
                        <span className="font-display text-xl text-[#e1b12c] font-black">{item.golesLocReal} - {item.golesVisReal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visiter Flag info */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-8 rounded overflow-hidden bg-slate-50 flex items-center justify-center border  shadow-sm">
                      <img 
                        alt={item.visitante} 
                        className="w-full h-full object-cover" 
                        src={item.banderaVis} 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="font-sans text-xs font-bold text-slate-700">{item.visitante}</span>
                  </div>

                </div>

                {/* Obtained Points badge info on foot */}
                <div className="flex justify-center mt-1">
                  <div className={`px-4 py-1 rounded-full font-sans text-xs font-bold border shadow-sm ${item.puntosColor}`}>
                    {item.puntosLabel}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Install App Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowInstallModal(false)}></div>
          <div className="relative w-full max-w-[340px] theme-card rounded-3xl p-6 shadow-2xl animate-in font-sans text-center">
            
            <div className="w-16 h-16 bg-[#034226] text-[#e1b12c] rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg border-4 border-slate-50">
              <span className="material-symbols-outlined text-[32px]">download_for_offline</span>
            </div>

            <h3 className="font-display text-2xl theme-text-card mb-2">Instalar Goli Polla</h3>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Para tener la mejor experiencia y acceso rápido, instala esta aplicación en tu pantalla de inicio:
            </p>

            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="material-symbols-outlined text-slate-400 mt-0.5">apple</span>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">En iPhone (Safari)</h4>
                  <p className="text-xs text-slate-500 mt-1">Toca el botón <strong>Compartir</strong> en la barra inferior y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="material-symbols-outlined text-slate-400 mt-0.5">android</span>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">En Android (Chrome)</h4>
                  <p className="text-xs text-slate-500 mt-1">Toca el menú <strong>(tres puntos)</strong> en la esquina superior derecha y selecciona <strong>"Añadir a la pantalla de inicio"</strong> o "Instalar aplicación".</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowInstallModal(false)}
              className="mt-6 w-full bg-slate-100 theme-text-card font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
