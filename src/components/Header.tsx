/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Partido } from '../types';

interface HeaderProps {
  usuario: any;
  grupoNombre?: string;
  onLogout: () => void;
  onChangeGroup: () => void;
  onOpenChat: () => void;
  partidos: any[];
  onGoToSettings?: () => void;
  themeMode?: string;
  setThemeMode?: (theme: string) => void;
  activeThemes?: string[];
}

export default function Header({ usuario, grupoNombre, onLogout, onChangeGroup, onOpenChat, partidos = [], onGoToSettings, themeMode, setThemeMode, activeThemes = [], onToggleNotifications }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const isConsoleMode = themeMode === 'kilocode' || themeMode === 'cyberpunk';
  const consoleColor = themeMode === 'cyberpunk' ? 'text-[#00FFB2]' : 'header-accent-text';
  const consoleBorderClass = themeMode === 'cyberpunk' ? 'border-[#00FFB2]' : 'header-accent-border';

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
    <header className="fixed top-0 left-0 w-full z-50 border-b-4 app-nav-bar text-white shadow-md flex justify-between items-center px-4 h-16 shrink-0">
      {/* Profil capsule and title */}
      <div className="flex items-center gap-2">
        <div className="relative w-11 h-11 shrink-0">
          <svg className="absolute inset-[-10%] w-[120%] h-[120%] animate-spin header-accent-text -z-10" style={{ animationDuration: '6s' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="70 30" strokeLinecap="round" />
          </svg>
          <svg className="absolute inset-[-20%] w-[140%] h-[140%] animate-[spin_9s_linear_infinite_reverse] text-[#000000] opacity-30 -z-10" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="50 150" strokeLinecap="round" />
          </svg>
          <img src="/logo.png" alt="GOLI" className="w-full h-full object-contain rounded-full shadow-lg bg-[#034226]" />
        </div>
        <div className="flex flex-col justify-center">
            <span className="text-[10px] header-accent-text font-bold tracking-widest uppercase mb-[-2px] flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">group</span>
              GRUPO
            </span>
            <span className="font-display text-[13px] tracking-wider text-white leading-none uppercase mt-0.5 truncate max-w-[120px]">
              {grupoNombre || usuario.codigoGrupo || 'FOE'}
            </span>
        </div>
      </div>

      {/* Actions container */}
      <div className="flex items-center gap-1.5">
        {/* Chat Button */}
        <button 
          onClick={onOpenChat}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#25D366] border border-[#1ebd58] hover:bg-[#20b858] transition-colors cursor-pointer shadow-md"
          title="Grupo de WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
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
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/15 border border-white/20 hover:bg-black/25 transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-white/80 text-[18px]">notifications</span>
            {hasAlert && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#02331d] animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="fixed left-4 right-4 top-[70px] sm:top-auto sm:absolute sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:mt-2 sm:w-[280px] theme-card border-theme rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 py-2 border-b border-theme flex justify-between items-center">
                <h4 className="font-bold text-current text-sm">Próximos Partidos</h4>
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
                      <div key={p.partidoId} className={`p-3 border-b border-slate-50 flex items-center gap-3 ${isUrgent ? 'bg-red-50/50' : 'hover:bg-black/5'}`}>
                        <div className="flex flex-col items-center shrink-0">
                          <img src={p.banderaLocal} alt={p.equipoLocal} className="w-5 h-3.5 object-cover rounded shadow-sm mb-1" />
                          <img src={p.banderaVisitante} alt={p.equipoVisitante} className="w-5 h-3.5 object-cover rounded shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-current truncate">{p.equipoLocal} vs {p.equipoVisitante}</p>
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
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors duration-200 min-h-[44px] ${isConsoleMode ? 'theme-card hover:bg-white/5' : 'rounded-[999px] border border-white/10 font-sans bg-white/5 hover:bg-white/15 active:bg-white/15'}`}
            >
            {usuario.foto ? (
              <img src={usuario.foto} alt="Perfil" className="w-10 h-10 rounded-full border-2 header-accent-border object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-2 header-accent-border shrink-0">
                <span className="material-symbols-outlined text-white/50 text-[20px]">person</span>
              </div>
            )}
            
            <div className="flex flex-col items-start leading-tight">
               <span className="text-white font-semibold text-[13px] truncate max-w-[70px] sm:max-w-[100px]">
                 {usuario.nombre.split(' ')[0]}
               </span>
               <span className="header-accent-text font-medium text-[11px] flex items-center gap-1">
                 <span className="sm:hidden text-[10px]">🏆</span>
                 {usuario.puntosTotal} <span className="hidden sm:inline">pts</span>
               </span>
            </div>

            <span 
              className="material-symbols-outlined header-accent-text text-[18px] transition-transform duration-200 ml-1" 
              style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}
            >
              expand_more
            </span>
          </button>

        {/* Dropdown Menu block in professional light design */}
        {showDropdown && (
          <div className={`fixed left-4 right-4 top-[70px] sm:top-auto sm:absolute sm:left-auto sm:right-0 sm:mt-2 ${isConsoleMode ? 'sm:w-64 bg-[#0a0b0d] border ' + consoleBorderClass + ' font-mono rounded-2xl' : 'sm:w-56 bg-white border border-slate-100 rounded-xl'} shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200`}>
            <div className={`px-4 ${isConsoleMode ? 'py-3 border-white/10' : 'py-2 border-slate-100'} border-b`}>
              <p className={`${isConsoleMode ? 'text-sm font-bold truncate uppercase tracking-widest ' + consoleColor : 'font-sans text-sm font-bold text-slate-800 truncate'}`}>
                {usuario.nombre}
              </p>
              <p className={`font-mono text-[10px] ${isConsoleMode ? 'text-slate-400' : 'text-slate-500'} truncate`}>
                {usuario.email}
              </p>
            </div>
            
            <div className="p-1">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onChangeGroup();
                }}
                className={`w-full flex items-center gap-3 ${isConsoleMode ? 'px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg uppercase tracking-wider ' + consoleColor : 'px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-lg'} transition-colors cursor-pointer text-left`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isConsoleMode ? 'text-slate-400' : 'text-[#034226]'}`}>
                  group_work
                </span>
                <span className="font-sans font-medium">Cambiar de Grupo</span>
              </button>

              {activeThemes.length > 0 && setThemeMode && themeMode && (
                <div className={`mx-3 mt-1 mb-2 rounded-[18px] p-1 flex items-center justify-between shadow-inner ${isConsoleMode ? 'bg-white/5 border border-white/5' : 'bg-slate-100'}`}>
                  {activeThemes.slice(0, 3).map((themeName) => {
                    let icon = 'palette';
                    let label = themeName;
                    if (themeName === 'dia') { icon = 'light_mode'; label = 'Día'; }
                    if (themeName === 'noche' || themeName === 'original') { icon = 'dark_mode'; label = 'Noche'; }
                    if (themeName === 'glass') { icon = 'layers'; label = 'Glass'; }
                    if (themeName === 'kilocode') { icon = 'keyboard_arrow_right'; label = 'Kilo'; }
                    if (themeName === 'cyberpunk') { icon = 'desktop_windows'; label = 'Cyber'; }

                    const isSelected = themeMode === themeName;

                    return (
                      <button
                        key={themeName}
                        onClick={() => {
                          setThemeMode(themeName);
                        }}
                        className={`flex-1 py-2 flex flex-col items-center justify-center gap-0.5 rounded-[14px] transition-all duration-300 ${
                            isSelected && themeName === 'kilocode' ? 'header-accent-bg text-black relative overflow-hidden' :
                            isSelected && themeName === 'cyberpunk' ? 'bg-[#00FFB2] text-black relative overflow-hidden' :
                            isSelected ? (isConsoleMode ? `bg-white/10 font-bold ${consoleColor}` : 'bg-white shadow-sm text-slate-900 font-bold') :
                            (isConsoleMode ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-black/5')
                          }`}
                      >
                        {isSelected && themeName === 'kilocode' && (
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)' }}></div>
                        )}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          {themeName === 'kilocode' ? (
                            <span className="font-mono font-bold text-lg leading-none" style={{ marginTop: '-4px', marginBottom: '2px' }}>{'>_'}</span>
                          ) : (
                            <span className="material-symbols-outlined text-[20px] leading-none mb-[2px]">{icon}</span>
                          )}
                          <span className="text-[11px] font-bold leading-none">{label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                  onClick={() => {
                    setShowDropdown(false);
                    if (onGoToSettings) onGoToSettings();
                  }}
                  className={`w-full flex items-center gap-3 ${isConsoleMode ? 'px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg uppercase tracking-wider ' + consoleColor : 'px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-lg'} transition-colors cursor-pointer text-left`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isConsoleMode ? 'text-slate-400' : 'text-[#034226]'}`}>
                    settings
                  </span>
                  <span className="font-sans font-medium">Configuración</span>
                </button>

                {/* Notifications Quick Toggle */}
                {onToggleNotifications && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleNotifications(usuario.notificationsEnabled === false ? true : false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 ${isConsoleMode ? 'px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg uppercase tracking-wider ' + consoleColor : 'px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg'} transition-colors text-left cursor-pointer`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[18px] ${isConsoleMode ? 'text-slate-400' : 'text-[#034226]'}`}>
                        {usuario.notificationsEnabled !== false ? 'notifications_active' : 'notifications_off'}
                      </span>
                      <span className="font-sans font-medium">Notificaciones</span>
                    </div>
                    <button 
                      className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 pointer-events-none ${usuario.notificationsEnabled !== false ? (isConsoleMode ? 'bg-[#00FFB2]' : 'bg-[#034226]') : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${usuario.notificationsEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                )}

                <div className={`h-[1px] my-1 ${isConsoleMode ? 'bg-white/5' : 'bg-slate-100'}`} />

                <button
                  onClick={() => {
                    setShowInstallModal(true);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 ${isConsoleMode ? 'px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg uppercase tracking-wider ' + consoleColor : 'px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-lg'} transition-colors cursor-pointer text-left`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isConsoleMode ? 'text-slate-400' : 'text-[#034226]'}`}>download</span>
                  <span className="font-sans font-medium">Instalar App</span>
                </button>

                <button
                  onClick={handleShareApp}
                  className={`w-full flex items-center gap-3 ${isConsoleMode ? 'px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg uppercase tracking-wider ' + consoleColor : 'px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-lg'} transition-colors cursor-pointer text-left`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isConsoleMode ? 'text-slate-400' : 'header-accent-text'}`}>share</span>
                  <span className="font-sans font-medium">Compartir App</span>
                </button>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                  className={`w-full flex items-center gap-3 ${isConsoleMode ? 'px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg uppercase tracking-wider ' + consoleColor : 'px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg'} transition-colors cursor-pointer text-left`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isConsoleMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    switch_account
                  </span>
                  <span className="font-sans font-medium">Cambiar / Añadir cuenta</span>
                </button>

                <div className={`h-[1px] my-1 ${isConsoleMode ? 'bg-white/5' : 'bg-slate-100'}`} />

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                  className={`w-full flex items-center gap-3 ${isConsoleMode ? 'px-4 py-2.5 text-sm hover:bg-white/5 rounded-lg uppercase tracking-wider text-red-500' : 'px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg'} transition-colors cursor-pointer text-left`}
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
            <div className="w-16 h-16 bg-[#034226] header-accent-text rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg border-4 border-slate-50">
              <span className="material-symbols-outlined text-[32px]">download_for_offline</span>
            </div>
            <h3 className="font-display text-2xl text-slate-900 mb-2">Instalar Goli Polla</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Para tener la mejor experiencia y acceso rápido, instala esta aplicación en tu pantalla de inicio:
            </p>
            <div className="space-y-4 text-left mb-6">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="material-symbols-outlined text-slate-400 mt-0.5">apple</span>
                <div>
                  <h4 className="font-bold text-slate-800 opacity-90 text-sm">En iPhone (Safari)</h4>
                  <p className="text-xs text-slate-500 mt-1">Toca el botón <strong>Compartir</strong> en la barra inferior y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="material-symbols-outlined text-slate-400 mt-0.5">android</span>
                <div>
                  <h4 className="font-bold text-slate-800 opacity-90 text-sm">En Android (Chrome)</h4>
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
