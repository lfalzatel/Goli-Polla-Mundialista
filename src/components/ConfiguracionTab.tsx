import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

interface ConfiguracionTabProps {
  usuario: any;
  themeMode: string;
  setThemeMode: (theme: string) => void;
  activeThemes: string[];
  setActiveThemes: (themes: string[]) => void;
  onLogout: () => void;
}

const AVAILABLE_THEMES = [
  { id: 'dia', name: 'Día', icon: 'light_mode' },
  { id: 'noche', name: 'Original', icon: 'dark_mode' },
  { id: 'glass', name: 'Glass', icon: 'layers' },
  { id: 'cyberpunk', name: 'Cyber', icon: 'terminal' },
  { id: 'kilocode', name: 'Kilo', icon: 'bolt' }
];

export default function ConfiguracionTab({ usuario, themeMode, setThemeMode, activeThemes, setActiveThemes, onLogout }: ConfiguracionTabProps) {
  const [resetSent, setResetSent] = useState(false);

  const handleToggleTheme = (themeId: string) => {
    if (activeThemes.includes(themeId)) {
      setActiveThemes(activeThemes.filter(t => t !== themeId));
    } else {
      setActiveThemes([...activeThemes, themeId]);
    }
  };

  const handleResetPassword = async () => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, usuario.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error al enviar el correo');
    }
  };

  return (
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SECCIÓN APARIENCIA */}
      <section className="bg-[#034226] border border-[#e1b12c]/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 stadium-mesh opacity-20 pointer-events-none"></div>
        <h2 className="text-[#e1b12c] font-display text-xl mb-4 flex items-center gap-2 relative z-10">
          <span className="material-symbols-outlined">palette</span>
          GESTIÓN DE TEMAS
        </h2>
        
        <p className="text-sm text-slate-200 font-sans mb-4 relative z-10">Tema Visual Activo</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 relative z-10">
          {AVAILABLE_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setThemeMode(theme.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${themeMode === theme.id ? 'border-[#e1b12c] bg-[#e1b12c]/10 text-[#e1b12c] scale-105 shadow-lg shadow-[#e1b12c]/20' : 'border-slate-500/30 bg-black/20 text-slate-300 hover:border-slate-400'}`}
            >
              <span className="material-symbols-outlined text-[28px] mb-2">{theme.icon}</span>
              <span className="font-sans font-bold text-sm">{theme.name}</span>
            </button>
          ))}
        </div>

        <div className="h-[1px] bg-[#e1b12c]/20 my-4 relative z-10"></div>

        <p className="text-sm text-slate-200 font-sans mb-4 relative z-10">Modos en Menú Desplegable</p>
        <div className="space-y-3 relative z-10">
          {AVAILABLE_THEMES.map(theme => (
            <label key={`toggle-${theme.id}`} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-slate-500/30 cursor-pointer hover:bg-black/30 transition-colors">
              <span className="font-mono text-sm text-slate-100">{theme.name === 'Original' ? 'Noche (Original)' : theme.name}</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-[#e1b12c]"
                checked={activeThemes.includes(theme.id)}
                onChange={() => handleToggleTheme(theme.id)}
              />
            </label>
          ))}
        </div>
      </section>

      {/* SECCIÓN CUENTA Y PERFIL */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
        <h2 className="text-[#e1b12c] font-display text-xl mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">person</span>
          CUENTA Y PERFIL
        </h2>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 mb-3">
          <div>
            <p className="font-bold text-slate-200 text-sm">Rol de Cuenta</p>
            <p className="text-xs text-slate-400 mt-1">{usuario.esAdmin ? 'Administrador' : 'Usuario General'}</p>
          </div>
          <span className="material-symbols-outlined text-[#e1b12c]">shield_person</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 mb-3">
          <div>
            <p className="font-bold text-slate-200 text-sm">Contraseña</p>
            <p className="text-xs text-slate-400 mt-1">Enviar enlace de recuperación a tu correo</p>
          </div>
          <button 
            onClick={handleResetPassword}
            className="bg-[#e1b12c] text-[#034226] px-3 py-1.5 rounded-lg font-bold text-xs uppercase hover:bg-[#cda024] transition-colors"
          >
            {resetSent ? 'Enviado!' : 'Resetear'}
          </button>
        </div>
      </section>

      {/* SECCIÓN GESTIÓN (ADMIN) */}
      {usuario.esAdmin && (
        <section className="bg-gradient-to-br from-[#034226] to-[#045c36] border border-[#e1b12c]/40 rounded-2xl p-5 shadow-xl">
          <h2 className="text-[#e1b12c] font-display text-xl mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">admin_panel_settings</span>
            GESTIÓN DE USUARIOS
          </h2>
          <p className="text-sm text-white/80 mb-4 font-sans">Aquí podrás listar y editar todos los usuarios de la plataforma.</p>
          
          {/* Admin User List Placeholder */}
          <div className="p-6 border-2 border-dashed border-[#e1b12c]/40 rounded-xl text-center bg-black/20">
            <span className="material-symbols-outlined text-[#e1b12c] text-4xl mb-2 opacity-80 animate-pulse">group_search</span>
            <p className="text-sm text-[#e1b12c] font-bold">Listado de Usuarios</p>
            <p className="text-xs text-white/60 mt-1">Próximamente disponible vía panel Firebase</p>
          </div>
        </section>
      )}

      {/* SECCIÓN APP */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-md">
        <h2 className="text-slate-400 font-display text-xl mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">app_shortcut</span>
          APLICACIÓN
        </h2>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 hover:bg-black/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#e1b12c]">download</span>
              <span className="font-bold text-slate-200 text-sm">Instalar Aplicación (PWA)</span>
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5 hover:bg-black/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#e1b12c]">share</span>
              <span className="font-bold text-slate-200 text-sm">Compartir App</span>
            </div>
          </button>
          
          <div className="p-3 rounded-lg border border-white/5 text-center mt-6">
            <p className="text-xs font-mono text-slate-500">GOLI Polla Mundialista v2.2.0</p>
          </div>
        </div>
      </section>

    </div>
  );
}
