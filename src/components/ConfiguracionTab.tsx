import React, { useState, useEffect } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, getDocs, updateDoc, writeBatch } from 'firebase/firestore';

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
  
  // Admin Group States
  const [misGrupos, setMisGrupos] = useState<any[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [groupCreateMsg, setGroupCreateMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Admin Users States
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({ esAdmin: false, codigoGrupo: '', whatsapp: '', gruposPermitidos: [] as string[] });

  useEffect(() => {
    if (!usuario.esAdmin && usuario.email !== 'lfalzatel@gmail.com') return;

    // 1. Fetch Admin Groups
    const qGrupos = query(collection(db, 'pm_grupos'), where("creadoPor", "==", usuario.email));
    const unsub = onSnapshot(qGrupos, (snapshot) => {
      const g: any[] = [];
      snapshot.forEach(doc => g.push({ id: doc.id, ...doc.data() }));
      setMisGrupos(g);
    });

    // 1.5 Fetch All Groups for Checklist
    const unsubAllGroups = onSnapshot(collection(db, 'pm_grupos'), (snapshot) => {
      const gList: any[] = [];
      snapshot.forEach(doc => gList.push({ id: doc.id, ...doc.data() }));
      setAllGroups(gList);
    });

    // 2. Fetch All Users
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const usersSnap = await getDocs(collection(db, 'pm_usuarios'));
        const uList: any[] = [];
        usersSnap.forEach(d => uList.push({ id: d.id, ...d.data() }));
        setAllUsers(uList);
      } catch(e) {
        console.error("Error fetching users:", e);
      }
      setLoadingUsers(false);
    };
    fetchUsers();

    return () => { unsub(); unsubAllGroups(); };
  }, [usuario.esAdmin, usuario.email]);

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
        creadoPor: usuario.email,
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

  const handleCopyCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiedCode(codigo);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenEditUser = (u: any) => {
    setEditingUser(u);
    setEditFormData({ 
      esAdmin: !!u.esAdmin, 
      codigoGrupo: u.codigoGrupo || '', 
      whatsapp: u.whatsapp || '',
      gruposPermitidos: u.gruposPermitidos || [u.codigoGrupo || '']
    });
  };

  const handleSaveUserEdit = async () => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, 'pm_usuarios', editingUser.id), {
        esAdmin: editFormData.esAdmin,
        codigoGrupo: editFormData.codigoGrupo,
        whatsapp: editFormData.whatsapp,
        gruposPermitidos: editFormData.gruposPermitidos
      });
      setAllUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...editFormData } : u));
      setEditingUser(null);
    } catch (e) {
      console.error("Error updating user", e);
      alert('Error al guardar cambios');
    }
  };

  const handleChangeUserRole = async (uid: string, esAdmin: boolean) => {
    try {
      await updateDoc(doc(db, 'pm_usuarios', uid), { esAdmin });
      setAllUsers(prev => prev.map(u => u.id === uid ? { ...u, esAdmin } : u));
    } catch (e) {
      console.error("Error updating user role", e);
    }
  };

  const handleShareApp = () => {
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
    <div className="space-y-6 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SECCIÓN APARIENCIA */}
      <section className="premium-card border rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 stadium-mesh opacity-20 pointer-events-none"></div>
        <h2 className="premium-card-title font-display text-xl mb-4 flex items-center gap-2 relative z-10">
          <span className="material-symbols-outlined">palette</span>
          GESTIÓN DE TEMAS
        </h2>
        
        <p className="text-sm theme-text opacity-70 font-sans mb-4 relative z-10">Tema Visual Activo</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 relative z-10">
          {AVAILABLE_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setThemeMode(theme.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${themeMode === theme.id ? 'border-current bg-current/10 premium-card-title scale-105 shadow-lg shadow-xl' : 'border-slate-500/30 theme-card/10 theme-text-card opacity-80 hover:border-slate-400'}`}
            >
              <span className="material-symbols-outlined text-[28px] mb-2">{theme.icon}</span>
              <span className="font-sans font-bold text-sm">{theme.name}</span>
            </button>
          ))}
        </div>

        <div className="h-[1px] bg-current/20 my-4 relative z-10"></div>

        <p className="text-sm theme-text opacity-70 font-sans mb-4 relative z-10">Modos en Menú Desplegable</p>
        <div className="space-y-3 relative z-10">
          {AVAILABLE_THEMES.map(theme => (
            <label key={`toggle-${theme.id}`} className="flex items-center justify-between p-3 rounded-lg theme-card/10 border border-slate-500/30 cursor-pointer hover:theme-card/20 transition-colors">
              <span className="font-mono text-sm theme-text-card">{theme.name === 'Original' ? 'Noche (Original)' : theme.name}</span>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-current"
                checked={activeThemes.includes(theme.id)}
                onChange={() => handleToggleTheme(theme.id)}
              />
            </label>
          ))}
        </div>
      </section>

      {/* SECCIÓN CUENTA Y PERFIL */}
      <section className="theme-card/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
        <h2 className="premium-card-title font-display text-xl mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">person</span>
          CUENTA Y PERFIL
        </h2>
        
        <div className="flex items-center justify-between p-3 rounded-lg theme-card/20 border border-white/5 mb-3">
          <div>
            <p className="font-bold theme-text opacity-70 text-sm">Rol de Cuenta</p>
            <p className="text-xs text-slate-400 mt-1">{usuario.esAdmin ? 'Administrador' : 'Usuario General'}</p>
          </div>
          <span className="material-symbols-outlined premium-card-title">shield_person</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg theme-card/20 border border-white/5 mb-3">
          <div>
            <p className="font-bold theme-text opacity-70 text-sm">Contraseña</p>
            <p className="text-xs text-slate-400 mt-1">Enviar enlace de recuperación a tu correo</p>
          </div>
          <button 
            onClick={handleResetPassword}
            className="premium-button-accent px-3 py-1.5 rounded-lg font-bold text-xs uppercase hover:bg-[#cda024] transition-colors"
          >
            {resetSent ? 'Enviado!' : 'Resetear'}
          </button>
        </div>
      </section>

      {/* SECCIÓN GESTIÓN (ADMIN) */}
      {(usuario.esAdmin || usuario.email === 'lfalzatel@gmail.com') && (
        <section className="premium-card border rounded-2xl p-5 shadow-xl">
          <h2 className="premium-card-title font-display text-xl mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">admin_panel_settings</span>
            PANEL DE ADMINISTRADOR
          </h2>
          
          <div className="theme-card/10 rounded-xl p-4 mb-4 border border-white/10">
            <h4 className="font-sans font-bold premium-card-title mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              Crear Nuevo Grupo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input 
                type="text" 
                placeholder="Nombre del Grupo (Ej. Empresa X)" 
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                className="w-full theme-card border border-current rounded-lg py-2 px-3 text-sm theme-text-card font-semibold focus:ring-2 focus:ring-current outline-none"
              />
              <input 
                type="text" 
                placeholder="Código Único (Ej. GOLI2026)" 
                value={newGroupCode}
                onChange={e => setNewGroupCode(e.target.value)}
                className="w-full theme-card border border-current rounded-lg py-2 px-3 text-sm theme-text-card font-semibold focus:ring-2 focus:ring-current outline-none uppercase"
              />
            </div>
            <button
              onClick={handleCreateGroup}
              className="premium-button-accent hover:opacity-90 font-sans text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 w-full md:w-auto"
            >
              Crear Grupo
            </button>
            {groupCreateMsg && <p className="text-green-300 text-xs font-bold mt-2">{groupCreateMsg}</p>}
          </div>

          {/* Lista de Grupos */}
          {misGrupos.length > 0 && (
            <div className="theme-card/10 rounded-xl p-4 mb-4 border border-white/10">
              <h4 className="font-sans font-bold premium-card-title mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">group</span>
                Tus Grupos Creados
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {misGrupos.map(g => (
                  <div key={g.id} className="theme-card/5 border border-white/10 rounded-lg p-3 flex flex-col gap-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <p className="font-bold theme-text-card text-sm leading-tight">{g.nombre}</p>
                        <button 
                          onClick={async () => {
                            const newName = window.prompt("Ingresa el nuevo nombre para el grupo:", g.nombre);
                            if (newName && newName.trim() !== g.nombre) {
                              try {
                                await updateDoc(doc(db, 'pm_grupos', g.id), { nombre: newName.trim() });
                              } catch(e) { console.error("Error renaming group", e); }
                            }
                          }}
                          className="text-slate-400 hover:theme-text-card transition-colors p-0.5"
                          title="Editar nombre"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                      </div>
                      <p className={`text-[10px] uppercase tracking-widest font-semibold mt-0.5 ${g.activo !== false ? 'text-green-300' : 'text-red-400'}`}>
                        {g.activo !== false ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full justify-between">
                      <button 
                        onClick={async () => {
                          try {
                            await updateDoc(doc(db, 'pm_grupos', g.id), { activo: g.activo === false ? true : false });
                          } catch(e) { console.error("Error toggling group", e); }
                        }}
                        className={`text-[10px] px-2 py-1 rounded font-bold uppercase transition-colors ${g.activo !== false ? 'bg-red-500/20 text-red-300 hover:bg-red-500/40' : 'bg-green-500/20 text-green-300 hover:bg-green-500/40'}`}
                      >
                        {g.activo !== false ? 'Desactivar' : 'Activar'}
                      </button>
                      <button 
                        onClick={() => handleCopyCode(g.codigo)}
                        className={`font-mono font-bold text-xs px-3 py-1.5 rounded border transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                          copiedCode === g.codigo 
                            ? 'premium-button-accent border-[#cda023]' 
                            : 'theme-card/10 theme-text-card border-white/20 hover:theme-card/20'
                        }`}
                        title="Copiar código"
                      >
                        {copiedCode === g.codigo ? '¡COPIADO!' : g.codigo}
                        {copiedCode !== g.codigo && <span className="material-symbols-outlined text-[14px]">content_copy</span>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Listado de Usuarios */}
          <div className="theme-card/10 rounded-xl p-4 border border-white/10">
            <h4 className="font-sans font-bold premium-card-title mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Gestión de Usuarios
            </h4>
            
            {loadingUsers ? (
              <p className="theme-text-card text-xs text-center py-4 opacity-50 animate-pulse">Cargando usuarios...</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {allUsers.map(u => (
                  <div key={u.id} className="theme-card/5 border border-white/10 rounded-lg p-3 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={u.foto || "https://ui-avatars.com/api/?name=" + u.nombre} className="w-8 h-8 rounded-full bg-slate-200" alt={u.nombre} />
                      <div>
                        <p className="font-bold theme-text-card text-xs">{u.nombre}</p>
                        <p className="text-[10px] theme-text-card opacity-80">{u.email} • Grupo: <span className="premium-card-title font-mono">{u.codigoGrupo || 'N/A'}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenEditUser(u)}
                        className="theme-card/10 hover:theme-card/20 theme-text-card p-1.5 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECCIÓN APP */}
      <section className="theme-card/5 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-md">
        <h2 className="text-slate-400 font-display text-xl mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">app_shortcut</span>
          APLICACIÓN
        </h2>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 rounded-lg theme-card/20 border border-white/5 hover:bg-black/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined premium-card-title">download</span>
              <span className="font-bold theme-text opacity-70 text-sm">Instalar Aplicación (PWA)</span>
            </div>
          </button>
          
          <button onClick={handleShareApp} className="w-full flex items-center justify-between p-3 rounded-lg theme-card/20 border border-white/5 hover:bg-black/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined premium-card-title">share</span>
              <span className="font-bold theme-text opacity-70 text-sm">Compartir App</span>
            </div>
          </button>
          
          <div className="p-3 rounded-lg border border-white/5 text-center mt-6">
            <p className="text-xs font-mono text-slate-500">GOLI Polla Mundialista v2.2.0</p>
          </div>
        </div>
      </section>

      {/* Modal de Edición de Usuario */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingUser(null)}></div>
          <div className="relative w-full max-w-[340px] premium-card border rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 font-sans">
                        <div className="flex justify-between items-center">
                      <p className="font-mono text-xl premium-card-title font-bold tracking-widest">
                        {editingUser.codigoGrupo}
                      </p>
                    </div>
            
            <div className="flex items-center gap-3 mb-6 theme-card/5 p-3 rounded-xl border border-white/10">
              <img src={editingUser.foto || "https://ui-avatars.com/api/?name=" + editingUser.nombre} className="w-10 h-10 rounded-full bg-slate-200" alt="" />
              <div>
                <p className="font-bold theme-text-card text-sm">{editingUser.nombre}</p>
                <p className="text-xs text-slate-400">{editingUser.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold premium-card-title mb-1.5 uppercase">Rol</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditFormData({...editFormData, esAdmin: false})}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!editFormData.esAdmin ? 'bg-slate-100 theme-text-card border border-slate-300 shadow-inner' : 'theme-card/10 theme-text-card opacity-80 border border-transparent'}`}
                  >
                    Usuario
                  </button>
                  <button 
                    onClick={() => setEditFormData({...editFormData, esAdmin: true})}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${editFormData.esAdmin ? 'bg-slate-100 theme-text-card border border-slate-300 shadow-inner' : 'theme-card/10 theme-text-card opacity-80 border border-transparent'}`}
                  >
                    Administrador
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold premium-card-title mb-1.5 uppercase">Grupo Activo (Principal)</label>
                <select 
                  value={editFormData.codigoGrupo}
                  onChange={(e) => setEditFormData({...editFormData, codigoGrupo: e.target.value})}
                  className="w-full theme-card/20 border border-white/10 rounded-lg py-2.5 px-3 theme-text-card font-mono focus:border-current outline-none transition-colors appearance-none"
                >
                  <option value="">Seleccionar grupo...</option>
                  {allGroups.map(g => (
                    <option key={g.id} value={g.codigo} className="premium-card theme-text-card">
                      {g.nombre} ({g.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold premium-card-title mb-1.5 uppercase">Grupos Permitidos</label>
                <div className="max-h-32 overflow-y-auto theme-card/10 border border-white/10 rounded-lg p-2 space-y-1">
                  {allGroups.map(g => (
                    <label key={g.id} className="flex items-center gap-3 theme-text-card text-sm cursor-pointer hover:theme-card/5 p-1.5 rounded-md transition-colors">
                      <input 
                        type="checkbox" 
                        checked={editFormData.gruposPermitidos.includes(g.codigo)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditFormData(prev => ({
                            ...prev,
                            gruposPermitidos: checked 
                              ? [...prev.gruposPermitidos, g.codigo]
                              : prev.gruposPermitidos.filter(id => id !== g.codigo)
                          }));
                        }}
                        className="accent-current w-4 h-4 cursor-pointer"
                      />
                      <span>{g.nombre} <span className="text-slate-400 text-xs ml-1 font-mono">({g.codigo})</span></span>
                    </label>
                  ))}
                  {allGroups.length === 0 && <p className="text-xs text-slate-400 p-2 text-center">No hay grupos disponibles</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold premium-card-title mb-1.5 uppercase">WhatsApp</label>
                <input 
                  type="text"
                  value={editFormData.whatsapp}
                  onChange={(e) => setEditFormData({...editFormData, whatsapp: e.target.value})}
                  className="w-full theme-card/20 border border-white/10 rounded-lg py-2.5 px-3 theme-text-card font-sans focus:border-current outline-none transition-colors"
                  placeholder="Ej. 3001234567"
                />
              </div>
            </div>

            <button 
              onClick={handleSaveUserEdit}
              className="w-full premium-button-accent hover:opacity-90 font-bold py-3 rounded-xl mt-6 transition-all shadow-[0_4px_12px_rgba(225,177,44,0.3)] active:scale-95"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
