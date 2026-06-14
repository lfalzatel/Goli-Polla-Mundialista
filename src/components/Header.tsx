/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Partido } from '../types';

interface HeaderProps {
  usuario: {
    nombre: string;
    email: string;
    foto: string;
    puntosTotal: number;
    codigoGrupo: string;
  };
  onLogout: () => void;
  onChangeGroup: () => void;
  onOpenChat: () => void;
  partidos?: Partido[];
}

export default function Header({ usuario, onLogout, onChangeGroup, onOpenChat, partidos = [] }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Determinar próximos partidos y alertas
  const now = new Date();
  const proximosPartidos = partidos
    .filter(p => p.fechaHoraInicio > now.getTime())
    .sort((a, b) => a.fechaHoraInicio - b.fechaHoraInicio)
    .slice(0, 3); // Mostrar los próximos 3
    
  // Alerta si el próximo partido es en menos de 24 horas
  const hasAlert = proximosPartidos.length > 0 && 
    (proximosPartidos[0].fechaHoraInicio - now.getTime() < 24 * 60 * 60 * 1000);

  const handleShareApp = () => {
    setShowDropdown(false);
    if (navigator.share) {
      navigator.share({
        title: 'Goli Polla Mundialista',
        text: '¡Únete a mi grupo en la Polla Mundialista y demuestra que sabes de fútbol!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("La función de compartir no está disponible en este navegador.");
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#034226] text-white border-b-4 border-[#e1b12c] shadow-md flex justify-between items-center px-4 h-16 shrink-0">
      {/* Profil capsule and title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#e1b12c] hover:scale-105 transition-all cursor-pointer bg-white"
          aria-haspopup="true"
          aria-expanded={showDropdown}
        >
          {usuario.foto ? (
            <img 
              alt={usuario.nombre} 
              className="w-full h-full object-cover" 
              src={usuario.foto} 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-[#034226] flex items-center justify-center text-white font-bold">
              {usuario.nombre.substring(0, 2).toUpperCase()}
            </div>
          )}
        </button>
        <div>
          <span className="font-mono text-[9px] text-[#e1b12c] block tracking-widest uppercase leading-none font-bold">
            GRUPO {usuario.codigoGrupo || 'FOE'}
          </span>
          <h1 className="font-display text-2xl tracking-wider text-white leading-none select-none uppercase">
            GOLI <span className="text-[#e1b12c]">POLLA MUNDIALISTA</span>
          </h1>
        </div>
      </div>

      {/* Actions container */}
      <div className="flex items-center gap-3">
        {/* Chat Button */}
        <button 
          onClick={onOpenChat}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#25D366] border border-[#1ebd58] hover:bg-[#20b858] transition-colors cursor-pointer shadow-lg"
          title="Grupo de WhatsApp"
        >
          <span className="material-symbols-outlined text-white text-[20px]">forum</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowDropdown(false);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#02331d] border border-white/20 hover:bg-[#012213] transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-white/80 text-[20px]">notifications</span>
            {hasAlert && (
              <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#02331d] animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="fixed left-4 right-4 top-[70px] sm:top-auto sm:absolute sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:mt-2 sm:w-[280px] bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-sm">Próximos Partidos</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {proximosPartidos.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">No hay partidos próximos</p>
                ) : (
                  proximosPartidos.map(p => {
                    const diffTime = p.fechaHoraInicio - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isUrgent = diffDays <= 1;

                    return (
                      <div key={p.partidoId} className={`p-3 border-b border-slate-50 flex items-center gap-3 ${isUrgent ? 'bg-red-50/50' : 'hover:bg-slate-50'}`}>
                        <div className="flex flex-col items-center shrink-0">
                          <img src={p.banderaLocal} alt={p.equipoLocal} className="w-5 h-3.5 object-cover rounded shadow-sm mb-1" />
                          <img src={p.banderaVisitante} alt={p.equipoVisitante} className="w-5 h-3.5 object-cover rounded shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{p.equipoLocal} vs {p.equipoVisitante}</p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(p.fechaHoraInicio).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {isUrgent && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded uppercase shrink-0">¡Pronto!</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Points indicator cap with dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifications(false);
            }}
          className="flex items-center gap-2 bg-[#02331d] hover:bg-[#012213] pl-1.5 pr-2 py-1.5 rounded-full border border-white/20 font-sans cursor-pointer transition-all shadow-inner"
        >
          {usuario.foto ? (
            <img src={usuario.foto} alt="Perfil" className="w-6 h-6 rounded-full border border-white/20 object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-white/50 text-[14px]">person</span>
            </div>
          )}
          <div className="flex flex-col items-start leading-none pr-1">
            <span className="text-white/80 font-medium font-sans text-[10px]">Puntaje:</span>
            <span className="text-[#e1b12c] font-bold font-mono text-xs">
              {usuario.puntosTotal} pts
            </span>
          </div>
          <span className="material-symbols-outlined text-[#e1b12c] text-[20px] transition-transform duration-200" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}>
            arrow_drop_down
          </span>
        </button>

        {/* Dropdown Menu block in professional light design */}
        {showDropdown && (
          <div className="fixed left-4 right-4 top-[70px] sm:top-auto sm:absolute sm:left-auto sm:right-0 sm:mt-2 sm:w-56 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 text-slate-800">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="font-sans text-sm font-bold text-slate-800 truncate">
                {usuario.nombre}
              </p>
              <p className="font-mono text-[10px] text-slate-500 truncate">
                {usuario.email}
              </p>
            </div>
            
            <div className="p-1">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onChangeGroup();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-lg transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[#034226] text-[18px]">
                  group_work
                </span>
                <span className="font-sans font-medium">Cambiar de Grupo</span>
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  // Dynamic subtle toast instead of raw blocking window.alert
                  const toast = document.createElement('div');
                  toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-[#034226] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold z-50 transition-all transform scale-90 duration-300';
                  toast.textContent = 'Configuraciones locales sincronizadas';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.style.transform = 'translateY(10px) scale(1)', 10);
                  setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                  }, 2000);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-lg transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[#034226] text-[18px]">
                  settings
                </span>
                <span className="font-sans font-medium">Configuración</span>
              </button>

              <div className="h-[1px] bg-slate-100 my-1" />

              <button
                onClick={() => {
                  setShowInstallModal(true);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-lg transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[#034226] text-[18px]">download</span>
                <span className="font-sans font-medium">Instalar App</span>
              </button>

              <button
                onClick={handleShareApp}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-lg transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[#e1b12c] text-[18px]">share</span>
                <span className="font-sans font-medium">Compartir App</span>
              </button>

              <div className="h-[1px] bg-slate-100 my-1" />

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined text-[18px]">
                  logout
                </span>
                <span className="font-sans font-bold">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Install App Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowInstallModal(false)}></div>
          <div className="relative w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl animate-in font-sans text-center">
            <div className="w-16 h-16 bg-[#034226] text-[#e1b12c] rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg border-4 border-slate-50">
              <span className="material-symbols-outlined text-[32px]">download_for_offline</span>
            </div>
            <h3 className="font-display text-2xl text-slate-800 mb-2">Instalar Goli Polla</h3>
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
                  <p className="text-xs text-slate-500 mt-1">Toca el menú <strong>(tres puntos)</strong> arriba y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowInstallModal(false)}
              className="mt-6 w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
