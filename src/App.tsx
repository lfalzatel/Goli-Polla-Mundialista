/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Partido, Apuesta, RankedUser, Usuario, BonificacionesEspeciales } from './types';
import { PARTIDOS_INICIALES, RANKING_INICIAL, APUESTAS_INICIALES_PRESETS, calcularPuntosPartido } from './data';
import { db, auth, messagingPromise } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, writeBatch, getDocs, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { getToken, onMessage } from 'firebase/messaging';
import SplashLogin from './components/SplashLogin';
import Header from './components/Header';
import InicioTab from './components/InicioTab';
import ReglasTab from './components/ReglasTab';
import PerfilTab from './components/PerfilTab';
import RankingTab from './components/RankingTab';
import ConfiguracionTab from './components/ConfiguracionTab';

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>(PARTIDOS_INICIALES);
  const [apuestas, setApuestas] = useState<Apuesta[]>([]);
  const [rankingLideres, setRankingLideres] = useState<RankedUser[]>(RANKING_INICIAL);
  const [bonificaciones, setBonificaciones] = useState<BonificacionesEspeciales | null>(null);
  const [activeTab, setActiveTab] = useState<'inicio' | 'reglas' | 'perfil' | 'ranking' | 'configuracion'>('inicio');
  const [gruposData, setGruposData] = useState<Record<string, string>>({});
  const [tabRotationToggle, setTabRotationToggle] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showFloatingRanking, setShowFloatingRanking] = useState(false);
  const [showWhatsAppConfirm, setShowWhatsAppConfirm] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{title: string, body: string} | null>(null);
  
  // Themes
  const [themeMode, setThemeMode] = useState<string>(localStorage.getItem('goli_theme') || 'noche');
  const [activeThemes, setActiveThemes] = useState<string[]>(
    JSON.parse(localStorage.getItem('goli_active_themes') || '["dia", "noche", "glass", "kilocode", "cyberpunk"]')
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem('goli_theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('goli_active_themes', JSON.stringify(activeThemes));
  }, [activeThemes]);

  const isConsoleMode = themeMode === 'kilocode' || themeMode === 'cyberpunk';
  const consoleHex = themeMode === 'cyberpunk' ? '#00FFB2' : '#e1b12c';
  const consoleTextClass = themeMode === 'cyberpunk' ? 'text-[#00FFB2]' : 'text-[#e1b12c]';
  const consoleBgClass = themeMode === 'cyberpunk' ? 'bg-[#00FFB2]' : 'bg-[#e1b12c]';
  const consoleBorderClass = themeMode === 'cyberpunk' ? 'border-[#00FFB2]' : 'border-[#e1b12c]';
  const consoleShadowClass = themeMode === 'cyberpunk' ? 'shadow-[#00FFB2]/20' : 'shadow-[#e1b12c]/20';
  const isGlassMode = themeMode === 'glass';
      
  const activeTabClass = isConsoleMode 
    ? `${consoleBgClass} text-black w-16 h-14 rounded-none -translate-y-4 ${tabRotationToggle ? 'rotate-3' : '-rotate-3'} scale-110 border border-black shadow-lg ${consoleShadowClass} scanlines-bg` 
    : isGlassMode
      ? `bg-[#0ea5e9] text-white w-16 h-14 rounded-xl -translate-y-4 ${tabRotationToggle ? 'rotate-6' : '-rotate-6'} scale-110 shadow-lg shadow-[#0ea5e9]/40 border-2 border-[#0284c7]`
      : `bg-[#e1b12c] text-[#034226] w-16 h-14 rounded-xl -translate-y-4 ${tabRotationToggle ? 'rotate-6' : '-rotate-6'} scale-110 shadow-lg shadow-[#e1b12c]/40 border-2 border-[#034226]`;

  const inactiveTabClass = isConsoleMode 
    ? `py-2.5 px-4 ${consoleTextClass} opacity-60 hover:opacity-100 hover:bg-white/5` 
    : isGlassMode
      ? `py-2.5 px-4 text-white/70 hover:text-white`
      : `py-2.5 px-4 text-white/60 hover:text-white`;

  const handleTabClick = (tab: 'inicio' | 'reglas' | 'perfil' | 'ranking' | 'configuracion') => {
    setTabRotationToggle(!tabRotationToggle);
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };
  
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupCode, setNewGroupCode] = useState('');
  const [groupError, setGroupError] = useState('');
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Setup foreground notifications
  useEffect(() => {
    let unsubscribe = () => {};
    const setupMessaging = async () => {
      const messaging = await messagingPromise;
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('[App.tsx] Foreground message received. ', payload);
          // Play sound
          const audio = new Audio('/assets/sounds/notification.mp3');
          audio.play().catch(e => console.log('Audio play failed', e));
          
          // Show toast
          if (payload.notification) {
             setNotificationToast({
               title: payload.notification.title || 'Nueva Notificación',
               body: payload.notification.body || ''
             });
             setTimeout(() => setNotificationToast(null), 5000);
          }
        });
      }
    };
    setupMessaging();
    return () => unsubscribe();
  }, []);

  // Request Notification Permissions and save Token
  useEffect(() => {
    if (!usuario?.uid) return;
    
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const messaging = await messagingPromise;
          if (messaging) {
            // Importante: Aquí se usa la llave VAPID real generada en Firebase.
            const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
            if (token) {
              await setDoc(doc(db, 'users', usuario.uid), { fcmToken: token }, { merge: true });
            }
          }
        }
      } catch (e) {
        console.error('Push notification permission error', e);
      }
    };
    
    // Si ya está concedido, renueva el token, si no está denegado, lo pide
    if (Notification.permission !== 'denied') {
      requestPermission();
    }
  }, [usuario?.uid]);

  // Load configuration from Firebase on mount (only when user is authenticated)
  useEffect(() => {
    if (!usuario) return;

    // Listen to Matches
    const unsubPartidos = onSnapshot(collection(db, 'pm_partidos'), (snapshot) => {
      if (!snapshot.empty) {
        const p: Partido[] = [];
        snapshot.forEach(doc => p.push(doc.data() as Partido));
        
        // Merge with initial matches so we don't lose unplayed matches that aren't in DB yet
        const mergedPartidos = PARTIDOS_INICIALES.map(inicial => {
          const dbMatch = p.find(m => m.partidoId === inicial.partidoId);
          return dbMatch ? dbMatch : inicial;
        });
        
        setPartidos(mergedPartidos);
      } else {
        // Fallback to initial if db is completely empty
        setPartidos(PARTIDOS_INICIALES);
      }
    });

    // Listen to User's own bets for the active group
    const unsubApuestas = onSnapshot(collection(db, 'pm_apuestas'), (snapshot) => {
      const ap: Apuesta[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as Apuesta;
        // Filtrar apuestas: del usuario actual Y del grupo actual
        if (data.uid === usuario.uid && data.codigoGrupo === usuario.codigoGrupo) {
          ap.push(data);
        }
      });
      setApuestas(ap);
    });

    // Listen to User's own special bonuses
    const unsubBonos = onSnapshot(doc(db, 'pm_bonificaciones', usuario.uid), (docSnap) => {
      if (docSnap.exists()) {
        setBonificaciones(docSnap.data() as BonificacionesEspeciales);
      } else {
        setBonificaciones(null);
      }
    });

      const unsubUsuarios = onSnapshot(collection(db, 'pm_usuarios'), (snapshot) => {
        const ranking: RankedUser[] = [];
        snapshot.forEach(doc => {
          const data = doc.data() as Usuario;
          
          // Solo incluir usuarios que pertenezcan al grupo activo (o si es su grupo principal)
          const belongsToGroup = data.codigoGrupo === usuario.codigoGrupo || 
                                (data.gruposPermitidos && data.gruposPermitidos.includes(usuario.codigoGrupo));
          
          if (belongsToGroup) {
            const ptGlobal = data.puntosTotal || 0;
            const ptGrupo = data.puntosPorGrupo ? (data.puntosPorGrupo[usuario.codigoGrupo] || 0) : ptGlobal;

            ranking.push({
              uid: doc.id,
              nombre: data.nombre,
              foto: data.foto,
              puntosTotal: ptGrupo,
              posicion: 0,
              isMe: doc.id === usuario.uid,
              tendencia: "estable"
            });
          }
        });
        
        // Sort and assign positions
        ranking.sort((a, b) => b.puntosTotal - a.puntosTotal);
        ranking.forEach((r, idx) => r.posicion = idx + 1);
        setRankingLideres(ranking);

        // Update local user data if it changed in DB (for this group)
        const myRank = ranking.find(r => r.uid === usuario.uid);
        const myDoc = snapshot.docs.find(d => d.id === usuario.uid);
        if (myDoc) {
          const myData = myDoc.data() as Usuario;
          setUsuario(prev => {
            if (!prev) return prev;
            const pt = myRank?.puntosTotal ?? prev.puntosTotal;
            const gp = myData.gruposPermitidos || [];
            
            // Only update if something relevant changed to avoid infinite loops
            if (
              prev.puntosTotal !== pt || 
              JSON.stringify(prev.gruposPermitidos || []) !== JSON.stringify(gp) ||
              prev.esAdmin !== myData.esAdmin
            ) {
              const nextUser = { ...prev, ...myData, puntosTotal: pt, gruposPermitidos: gp };
              localStorage.setItem('polla_usuario', JSON.stringify(nextUser));
              return nextUser;
            }
            return prev;
          });
        }
      });

    const unsubGrupos = onSnapshot(collection(db, 'pm_grupos'), (snapshot) => {
      const gData: Record<string, string> = {};
      snapshot.forEach(doc => {
        gData[doc.id] = doc.data().nombre || doc.id;
      });
      setGruposData(gData);
    });

    return () => {
      unsubPartidos();
      unsubApuestas();
      unsubBonos();
      unsubUsuarios();
      unsubGrupos();
    };
  }, [usuario?.uid, usuario?.codigoGrupo]);

  // Sync state functions
  const handleLoginSuccess = (nombre: string, email: string, whatsapp: string, codigoGrupo: string, uid: string, fotoUrl?: string, gruposPermitidos?: string[]) => {
    const newUser: Usuario = {
      uid,
      nombre,
      email,
      foto: fotoUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB51HhLfnZaDiGtKYp7MwISidlkzLIvjuKRkqP-Z4Ht2dfgJK3G8Ve2q4QdXolTh7pung4KkLRXjVW-wEb_4UESxWciOP6HrVq2_JhM1XYhDssQTl7p5-ey-rgv2tfQCzfManWqd5WgZ8rShV-0IJFalxgyqdM5DuGNi-aMWPgI2fDBTcvn1bDgPNRX6YlC9MMlGEC_qv3OozOdRzTAWf5n3njxyzJz_10pMEEW1tGZ9t6OAaoy2zhSTVl1dQ10KnYavNUUhU2_0RU',
      whatsapp,
      codigoGrupo,
      gruposPermitidos,
      puntosTotal: 0,
      createdAt: new Date().toISOString()
    };
    
    setUsuario(newUser);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      setUsuario(null);
      localStorage.removeItem('polla_usuario');
      // Delay resetting isLoggingOut so SplashLogin can pick it up
      setTimeout(() => setIsLoggingOut(false), 3000);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      setIsLoggingOut(false);
    }
    setPartidos([]);
    setApuestas([]);
    setRankingLideres([]);
    setActiveTab('inicio');
  };

  const handleOpenGroupModal = () => {
    setNewGroupCode(usuario?.codigoGrupo || '');
    setGroupError('');
    setShowGroupModal(true);
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupCode.trim() || !usuario) return;
    
    const codeUpper = newGroupCode.trim().toUpperCase();
    if (codeUpper === usuario.codigoGrupo) {
      setShowGroupModal(false);
      return;
    }

    setIsJoiningGroup(true);
    setGroupError('');
    try {
      const grupoSnap = await getDoc(doc(db, 'pm_grupos', codeUpper));
      if (grupoSnap.exists() && grupoSnap.data().activo) {
        await updateDoc(doc(db, 'pm_usuarios', usuario.uid), {
          codigoGrupo: codeUpper
        });
        const updatedUser = { ...usuario, codigoGrupo: codeUpper };
        setUsuario(updatedUser);
        localStorage.setItem('polla_usuario', JSON.stringify(updatedUser));
        setShowGroupModal(false);
      } else {
        setGroupError('El código de grupo no existe o está inactivo.');
      }
    } catch (err) {
      console.error(err);
      setGroupError('Error al verificar el grupo.');
    } finally {
      setIsJoiningGroup(false);
    }
  };

  const handleUpdateWhatsapp = async (newPhone: string) => {
    if (usuario) {
      const updatedUser = { ...usuario, whatsapp: newPhone };
      setUsuario(updatedUser);
      // Guardar también en Firestore con merge para evitar errores si el documento es nuevo
      try {
        await setDoc(doc(db, 'pm_usuarios', usuario.uid), { whatsapp: newPhone }, { merge: true });
      } catch (e) {
        console.error("Error al actualizar WhatsApp", e);
      }
    }
  };

  const handleGuardarApuesta = async (partidoId: string, golesLocal: number, golesVisitante: number, totalGolesApuesta?: "mas25" | "menos25" | null) => {
    if (!usuario) return;

    const activeGroup = usuario.codigoGrupo || 'LACURVA1';
    const key = `${usuario.uid}_${partidoId}_${activeGroup}`;
    const targetMatch = partidos.find(p => p.partidoId === partidoId);
    
    // Validar si el partido ya inició o fue bloqueado
    if (targetMatch && (targetMatch.estado !== 'pendiente' || Date.now() > new Date(targetMatch.fechaHoraInicio).getTime())) {
      alert("No puedes apostar en un partido que ya comenzó o ha finalizado.");
      return;
    }

    let equipoGanadorApuesta = "empate";
    if (golesLocal > golesVisitante) equipoGanadorApuesta = "local";
    else if (golesVisitante > golesLocal) equipoGanadorApuesta = "visitante";

    const localApuesta: Apuesta = {
      codigoGrupo: activeGroup,
      id: key,
      uid: usuario.uid,
      partidoId,
      golesLocalApuesta: golesLocal,
      golesVisitanteApuesta: golesVisitante,
      equipoGanadorApuesta,
      empateApuesta: equipoGanadorApuesta === "empate",
      totalGolesApuesta: totalGolesApuesta || null,
      puntosObtenidos: 0,
      bloqueada: false
    };

    try {
      await setDoc(doc(db, 'pm_apuestas', key), localApuesta);
    } catch (e) {
      console.error("Error guardando apuesta", e);
    }
  };

  const handleGuardarBonificaciones = async (bonos: Partial<BonificacionesEspeciales>) => {
    if (!usuario) return;
    const newBonos = {
      ...bonos,
      uid: usuario.uid,
      puntosObtenidos: bonos.puntosObtenidos || 0
    } as BonificacionesEspeciales;
    try {
      await setDoc(doc(db, 'pm_bonificaciones', usuario.uid), newBonos);
    } catch (e) {
      console.error("Error guardando bonificaciones", e);
    }
  };

  const handleRepararPuntos = async () => {
    if (!usuario || (!usuario.esAdmin && usuario.email !== 'lfalzatel@gmail.com')) return;
    try {
      const usersSnap = await getDocs(collection(db, 'pm_usuarios'));
      const betsSnap = await getDocs(collection(db, 'pm_apuestas'));
      
      const userPoints: Record<string, {total: number, byGroup: Record<string, number>}> = {};
      usersSnap.forEach(u => {
        userPoints[u.id] = { total: 0, byGroup: {} };
      });
      
      betsSnap.forEach(docSnap => {
        const a = docSnap.data();
        let pts = 0;
        if (typeof a.puntosObtenidos === 'number') {
            pts = a.puntosObtenidos;
        } else if (a.puntosObtenidos && typeof a.puntosObtenidos.total === 'number') {
            pts = a.puntosObtenidos.total;
        }

        if (pts > 0 && userPoints[a.uid]) {
            userPoints[a.uid].total += pts;
            const grupo = a.codigoGrupo || 'LACURVA1';
            userPoints[a.uid].byGroup[grupo] = (userPoints[a.uid].byGroup[grupo] || 0) + pts;
        }
      });
      
      const batch = writeBatch(db);
      for (const uid of Object.keys(userPoints)) {
        const data = userPoints[uid];
        batch.update(doc(db, 'pm_usuarios', uid), {
            puntosTotal: data.total,
            puntosPorGrupo: data.byGroup
        });
      }
      await batch.commit();
      setNotificationToast({
        title: 'Reparación Exitosa',
        body: 'Se han recalculado todos los puntos históricos de los usuarios correctamente.'
      });
    } catch (e) {
      console.error(e);
      alert('Error reparando puntos.');
    }
  };

  // Simulate schedule cloud function matches finalized
  const handleSimularPartidos = async (resultados: Record<string, { golesLocal: number; golesVisitante: number }>) => {
    if (!usuario) return;
    try {
      const batch = writeBatch(db);
      
      // 1. Guardar resultados de partidos en la base de datos (con merge por si no existían)
      for (const match of partidos) {
        if (resultados[match.partidoId]) {
          const matchRef = doc(db, 'pm_partidos', match.partidoId);
          const res = resultados[match.partidoId];
          batch.set(matchRef, {
            ...match,
            golesLocal: res.golesLocal,
            golesVisitante: res.golesVisitante,
            estado: 'finalizado'
          }, { merge: true });
        }
      }

      // 2. Traer todas las apuestas para recalcular puntajes
      const apuestasSnap = await getDocs(collection(db, 'pm_apuestas'));
      const apuestasList = apuestasSnap.docs.map(d => ({id: d.id, ...d.data()})) as (Apuesta & {id: string})[];
      
      const userPointsByGroup: Record<string, Record<string, number>> = {};

      apuestasList.forEach(apuesta => {
         if (resultados[apuesta.partidoId]) {
            // Recrear el partido con el resultado final simulado
            const partidoActualizado = {
                ...partidos.find(p => p.partidoId === apuesta.partidoId)!,
                golesLocal: resultados[apuesta.partidoId].golesLocal,
                golesVisitante: resultados[apuesta.partidoId].golesVisitante,
                estado: 'finalizado' as const
            };
            
            // Calcular puntos reales
            const puntosObj = calcularPuntosPartido(
              partidoActualizado.golesLocal!,
              partidoActualizado.golesVisitante!,
              apuesta.golesLocalApuesta,
              apuesta.golesVisitanteApuesta,
              apuesta.totalGolesApuesta
            );
            
            const puntosGanados = typeof puntosObj === 'number' ? puntosObj : (puntosObj.total || 0);

            // Guardar el objeto completo para tener el desglose
            batch.update(doc(db, 'pm_apuestas', apuesta.id), {
               puntosObtenidos: puntosObj
            });
            
            const grupoBet = apuesta.codigoGrupo || 'LACURVA1';
            if (!userPointsByGroup[apuesta.uid]) userPointsByGroup[apuesta.uid] = {};
            userPointsByGroup[apuesta.uid][grupoBet] = (userPointsByGroup[apuesta.uid][grupoBet] || 0) + puntosGanados;
         }
      });

      // 3. Recalcular el total de puntos de CADA usuario desde cero para garantizar sincronía perfecta
      const usersSnap = await getDocs(collection(db, 'pm_usuarios'));
      
      usersSnap.forEach(uDoc => {
          const uid = uDoc.id;
          if (userPointsByGroup[uid]) {
            const uData = uDoc.data();
            const currentPointsGroupMap = uData.puntosPorGrupo || {};
            let changed = false;
            for (const [gCode, newPoints] of Object.entries(userPointsByGroup[uid])) {
               if (currentPointsGroupMap[gCode] !== newPoints) {
                 currentPointsGroupMap[gCode] = newPoints;
                 changed = true;
               }
            }
            if (changed) {
              batch.update(doc(db, 'pm_usuarios', uid), { 
                puntosPorGrupo: currentPointsGroupMap,
                puntosTotal: currentPointsGroupMap[uData.codigoGrupo || 'LACURVA1'] || 0
              });
            }
          }
      });

      await batch.commit();
      setNotificationToast({
        title: 'Actualización Exitosa',
        body: 'Resultados de la fecha simulados y actualizados en Firestore. Se han repartido puntos según las reglas.'
      });
      setTimeout(() => setNotificationToast(null), 5000);
    } catch (e) {
      console.error(e);
      // Silently fail, or could use a toast mechanism in the future
    }
  };

  // If the user isn't logged in, show the Splash and Google sign-in
  if (!usuario) {
    return <SplashLogin onLoginSuccess={handleLoginSuccess} isLoggingOut={isLoggingOut} />;
  }

  return (
    <div className="min-h-screen theme-bg pb-28 transition-colors duration-500">
      
      {/* Background aesthetics layer */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-tr from-[var(--bg-app)] via-[var(--bg-app-grad)] to-[var(--bg-app-grad)] opacity-90 transition-colors duration-500"></div>
      <div className="fixed inset-0 -z-10 stadium-mesh opacity-30"></div>

      {/* Main navigation header */}
      <Header 
        usuario={usuario} 
        grupoNombre={gruposData[usuario.codigoGrupo] || usuario.codigoGrupo}
        onLogout={handleLogout} 
        onChangeGroup={handleOpenGroupModal}
        onOpenChat={() => setShowWhatsAppConfirm(true)}
        partidos={partidos}
        onGoToSettings={() => setActiveTab('configuracion')}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        activeThemes={activeThemes}
      />

      {/* Group Change Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#034226] to-[#045c36] p-5">
              <h3 className="text-xl font-display text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e1b12c]">group</span>
                Cambiar de Grupo
              </h3>
              <p className="text-[#e1b12c] font-sans text-xs mt-1">Selecciona o ingresa el código del grupo</p>
            </div>
            
            <form onSubmit={handleJoinGroup} className="p-5 flex flex-col gap-4">
                
              {usuario?.gruposPermitidos && usuario.gruposPermitidos.length > 0 && (
                <div className="flex flex-col gap-2 mb-2">
                  <label className="font-sans text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">
                    Tus Grupos Permitidos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {usuario.gruposPermitidos.map(gCode => (
                      <button 
                        key={gCode}
                        type="button"
                        onClick={() => setNewGroupCode(gCode)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border ${newGroupCode.toUpperCase() === gCode ? 'bg-[#034226] text-white border-[#034226]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                      >
                        {gruposData[gCode] || gCode} <span className="text-[10px] font-mono opacity-70 ml-1">({gCode})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">
                  Código de Acceso
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#034226] transition-colors">
                    tag
                  </span>
                  <input
                    required
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#034226] focus:ring-1 focus:ring-[#034226] rounded-xl py-3 pl-10 pr-4 font-mono text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
                    placeholder="EJ: NUEVO-GRUPO"
                    type="text"
                    value={newGroupCode}
                    onChange={(e) => setNewGroupCode(e.target.value)}
                  />
                </div>
                {groupError && (
                  <div className="flex items-center gap-1.5 text-red-500 bg-red-50 px-2 py-1.5 rounded-lg mt-1 border border-red-100">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span className="text-[11px] font-medium leading-tight">{groupError}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold font-sans text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isJoiningGroup || !newGroupCode.trim()}
                  className="flex-1 py-3 rounded-xl font-bold font-sans text-sm text-[#034226] bg-[#e1b12c] hover:bg-[#cda024] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isJoiningGroup ? (
                    <div className="w-5 h-5 border-2 border-[#034226] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Unirme'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Notification Toast */}
      {notificationToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white border-2 border-[#e1b12c] rounded-2xl p-4 shadow-2xl z-[100] animate-in fade-in slide-in-from-top-10 duration-300 w-11/12 max-w-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#034226] flex items-center justify-center shrink-0 border border-white relative">
            <span className="material-symbols-outlined text-[#e1b12c] text-[20px]">notifications_active</span>
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
          </div>
          <div>
            <h4 className="font-bold text-[#034226] text-sm font-sans">{notificationToast.title}</h4>
            <p className="text-slate-600 text-xs font-sans mt-0.5 leading-snug">{notificationToast.body}</p>
          </div>
          <button onClick={() => setNotificationToast(null)} className="ml-auto text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Main Content View with extra bottom padding for navbar */}
      <main className="pt-20 pb-24 md:pb-20 max-w-4xl mx-auto p-4 md:p-6 min-h-[calc(100vh-64px)] overflow-x-hidden">
        
        {/* Global Page Header */}
        <div className="mb-6 border p-4 shadow-xl flex items-center justify-center relative overflow-hidden app-page-header">
          <div className={`absolute inset-0 stadium-mesh ${isConsoleMode ? 'opacity-5' : 'opacity-20'}`}></div>
          <h1 className={`font-display tracking-wider leading-none select-none uppercase text-center relative z-10 app-page-header-title ${isConsoleMode ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'}`}>
            GOLI <span className="app-page-header-accent">POLLA MUNDIALISTA</span>
          </h1>
        </div>

        {activeTab === 'inicio' && (
          <InicioTab 
            partidos={partidos} 
            apuestas={apuestas} 
            bonificaciones={bonificaciones}
            isAdmin={usuario.esAdmin || usuario.email === 'lfalzatel@gmail.com'}
            onGuardarApuesta={handleGuardarApuesta}
            onGuardarBonificaciones={handleGuardarBonificaciones}
            onSimularPartidos={handleSimularPartidos}
            onRepararPuntos={handleRepararPuntos}
          />
        )}

        {activeTab === 'reglas' && (
          <ReglasTab />
        )}

        {activeTab === 'perfil' && (
          <PerfilTab 
            nombre={usuario.nombre}
            foto={usuario.foto || ''}
            email={usuario.email}
            whatsapp={usuario.whatsapp || ''}
            codigoGrupo={usuario.codigoGrupo}
            grupoNombre={gruposData[usuario.codigoGrupo]}
            puntosTotal={usuario.puntosTotal}
            rankingLideres={rankingLideres}
            apuestas={apuestas}
            partidos={partidos}
            onUpdateWhatsapp={handleUpdateWhatsapp}
          />
        )}

        {activeTab === 'ranking' && (
          <RankingTab
            usuarios={rankingLideres}
            apuestas={apuestas}
            partidos={partidos}
            usuarioActualId={usuario.uid}
            activeGrupo={usuario.codigoGrupo}
          />
        )}

        {activeTab === 'configuracion' && (
          <ConfiguracionTab 
            usuario={usuario}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            activeThemes={activeThemes}
            setActiveThemes={setActiveThemes}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Floating Leaderboard Action Button (Contextual quick tool) */}
      <button 
        onClick={() => setShowFloatingRanking(!showFloatingRanking)}
        className="fixed bottom-24 right-4 w-12 h-12 premium-button-accent hover:opacity-80 rounded-full shadow-2xl flex items-center justify-center border border-white/20 active:scale-90 transition-all cursor-pointer z-40"
        title="Mostrar tabla de posiciones del grupo"
        aria-haspopup="dialog"
      >
        <span className="material-symbols-outlined font-bold text-xl">leaderboard</span>
      </button>

      {/* Floating Leaderboard Overview Dialogue Modal */}
      {showFloatingRanking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowFloatingRanking(false)}></div>
          <div className="relative w-full max-w-[340px] premium-card border rounded-2xl p-5 shadow-2xl animate-in font-sans">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-display text-xl premium-card-title tracking-wider uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-current">workspace_premium</span>
                Tabla del Grupo
              </h4>
              <button onClick={() => setShowFloatingRanking(false)} className="theme-text-muted hover:theme-text-card p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {rankingLideres.map(lead => {
                const isSelf = lead.uid === 'me';
                return (
                  <div 
                    key={lead.uid} 
                    className={`flex justify-between items-center p-2.5 rounded-xl border ${
                      isSelf ? 'theme-card section-title-accent' : 'theme-subcard border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs theme-text-muted w-4 text-center">#{lead.posicion}</span>
                      <img alt={lead.nombre} className="w-8 h-8 rounded-full border border-white/10" src={lead.foto} />
                      <span className={`text-xs font-semibold ${isSelf ? 'section-title-accent font-bold' : 'theme-text-card opacity-80'}`}>
                        {lead.nombre} {isSelf && '(Tú)'}
                      </span>
                    </div>
                    <span className="font-mono text-xs premium-card-title font-bold">{lead.puntosTotal} PTS</span>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => {
                setActiveTab('ranking');
                setShowFloatingRanking(false);
              }}
              className="mt-4 w-full theme-subcard section-title-accent border border-current hover:opacity-80 py-2 rounded-xl text-xs font-bold transition-all uppercase"
            >
              Ir a Desglose Completo
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Confirmation Modal */}
      {showWhatsAppConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowWhatsAppConfirm(false)}></div>
          <div className="relative w-full max-w-[320px] bg-[#1f1f23] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in font-sans text-center">
            
            <div className="w-16 h-16 bg-[#25D366]/20 text-[#25D366] rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg border-2 border-[#25D366]/50">
              <span className="material-symbols-outlined text-[32px]">forum</span>
            </div>

            <h3 className="font-display text-2xl text-white mb-2">¿Ir a WhatsApp?</h3>
            
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Estás a punto de salir de la aplicación para abrir el chat del grupo en WhatsApp.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowWhatsAppConfirm(false)}
                className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowWhatsAppConfirm(false);
                  window.open("https://chat.whatsapp.com/HWD3dsmIIQJIUAMylKVOND", "_blank");
                }}
                className="flex-1 bg-[#25D366] text-[#022100] font-bold py-3 rounded-xl hover:bg-[#20b858] transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled Premium Bottom Tab Bar Navigation navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 pb-4 pt-2.5 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] border-t-4 app-nav-bar rounded-t-3xl">
        
        {/* Tab: Inicio */}
        <button
          onClick={() => handleTabClick('inicio')}
          className={`flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative ${
            activeTab === 'inicio' ? activeTabClass : inactiveTabClass
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${activeTab === 'inicio' ? 'animate-bounce mt-1' : 'transition-transform duration-300'}`} style={{ fontVariationSettings: activeTab === 'inicio' ? "'FILL' 1" : "'FILL' 0" }}>
            home
          </span>
          <span className={`${isConsoleMode ? 'font-mono tracking-widest' : 'font-sans tracking-wide'} mt-0.5 uppercase ${activeTab === 'inicio' ? 'text-[9px] font-bold' : 'text-[10px] font-semibold'}`}>Inicio</span>
        </button>

        {/* Tab: Reglas */}
        <button
          onClick={() => handleTabClick('reglas')}
          className={`flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative ${
            activeTab === 'reglas' ? activeTabClass : inactiveTabClass
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${activeTab === 'reglas' ? 'animate-bounce mt-1' : 'transition-transform duration-300'}`} style={{ fontVariationSettings: activeTab === 'reglas' ? "'FILL' 1" : "'FILL' 0" }}>
            gavel
          </span>
          <span className={`${isConsoleMode ? 'font-mono tracking-widest' : 'font-sans tracking-wide'} mt-0.5 uppercase ${activeTab === 'reglas' ? 'text-[9px] font-bold' : 'text-[10px] font-semibold'}`}>Reglas</span>
        </button>

        {/* Tab: Perfil */}
        <button
          onClick={() => handleTabClick('perfil')}
          className={`flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative ${
            activeTab === 'perfil' ? activeTabClass : inactiveTabClass
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${activeTab === 'perfil' ? 'animate-bounce mt-1' : 'transition-transform duration-300'}`} style={{ fontVariationSettings: activeTab === 'perfil' ? "'FILL' 1" : "'FILL' 0" }}>
            person
          </span>
          <span className={`${isConsoleMode ? 'font-mono tracking-widest' : 'font-sans tracking-wide'} mt-0.5 uppercase ${activeTab === 'perfil' ? 'text-[9px] font-bold' : 'text-[10px] font-semibold'}`}>Perfil</span>
        </button>

        {/* Tab: Ranking */}
        <button
          onClick={() => handleTabClick('ranking')}
          className={`flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative ${
            activeTab === 'ranking' ? activeTabClass : inactiveTabClass
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${activeTab === 'ranking' ? 'animate-bounce mt-1' : 'transition-transform duration-300'}`} style={{ fontVariationSettings: activeTab === 'ranking' ? "'FILL' 1" : "'FILL' 0" }}>
            leaderboard
          </span>
          <span className={`${isConsoleMode ? 'font-mono tracking-widest' : 'font-sans tracking-wide'} mt-0.5 uppercase ${activeTab === 'ranking' ? 'text-[9px] font-bold' : 'text-[10px] font-semibold'}`}>Ranking</span>
        </button>

      </nav>
    </div>
  );
}
