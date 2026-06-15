/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
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
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[999px] border border-white/10 font-sans cursor-pointer transition-colors duration-200 min-h-[44px] bg-white/5 hover:bg-white/15 active:bg-white/15"
          >
            {usuario.foto ? (
              <img src={usuario.foto} alt="Perfil" className="w-10 h-10 rounded-full border-2 border-[#e1b12c] object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-2 border-[#e1b12c] shrink-0">
                <span className="material-symbols-outlined text-white/50 text-[20px]">person</span>
              </div>
            )}
            
            <div className="flex flex-col items-start leading-tight">
               <span className="text-white font-semibold text-[13px] truncate max-w-[70px] sm:max-w-[100px]">
                 {usuario.nombre.split(' ')[0]}
               </span>
               <span className="text-[#e1b12c] font-medium text-[11px] flex items-center gap-1">
                 <span className="sm:hidden text-[10px]">🏆</span>
                 {usuario.puntosTotal} <span className="hidden sm:inline">pts</span>
               </span>
            </div>

            <span 
              className="material-symbols-outlined text-[#e1b12c] text-[18px] transition-transform duration-200 ml-1" 
              style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}
            >
              expand_more
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
