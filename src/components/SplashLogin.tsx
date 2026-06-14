/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface SplashLoginProps {
  onLoginSuccess: (nombre: string, email: string, whatsapp: string, codigoGrupo: string, uid: string, fotoUrl?: string) => void;
}

export default function SplashLogin({ onLoginSuccess }: SplashLoginProps) {
  const [loading, setLoading] = useState(true);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [codigoGrupo, setCodigoGrupo] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [errorText, setErrorText] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await handleUserAuth(user);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUserAuth = async (user: User) => {
    try {
      setLoading(true);
      // Check if user exists in Firestore
      const userRef = doc(db, 'pm_usuarios', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // User already in DB, skip profile completion
        const data = userSnap.data();
        onLoginSuccess(data.nombre, data.email, data.whatsapp, data.codigoGrupo, user.uid, data.foto || user.photoURL || undefined);
      } else {
        // Admin bypass auto-creation
        if (user.email === 'lfalzatel@gmail.com') {
          await setDoc(userRef, {
            nombre: user.displayName || 'Admin',
            email: user.email,
            foto: user.photoURL,
            whatsapp: '3000000000',
            codigoGrupo: 'ADMIN',
            puntosTotal: 0,
            createdAt: new Date().toISOString(),
            esAdmin: true
          });
          onLoginSuccess(user.displayName || 'Admin', user.email || '', '3000000000', 'ADMIN', user.uid, user.photoURL || undefined);
          return;
        }

        // New user, need group code and whatsapp
        setPendingUser(user);
        setShowCompleteProfile(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error validando usuario", error);
      setErrorText("Error al validar el usuario.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorText('');
      
      // Validar codigo de grupo si no es el admin
      let grupoValido = false;
      const codigoUpper = codigoGrupo.trim().toUpperCase();
      
      if (codigoUpper) {
        const grupoSnap = await getDoc(doc(db, 'pm_grupos', codigoUpper));
        if (grupoSnap.exists() && grupoSnap.data().activo) {
          grupoValido = true;
        } else {
          setErrorText("El código de grupo no existe o está inactivo.");
          return;
        }
      } else {
        // If they didn't enter a code, they might be an existing user trying to login or an admin.
        // We'll let them try, but if they are new and not admin, handleUserAuth will stop them later.
      }

      const result = await signInWithPopup(auth, googleProvider);
      await handleUserAuth(result.user);
    } catch (error: any) {
      console.error("Error en login con Google", error);
      if (error.code !== 'auth/popup-closed-by-user') {
         setErrorText("No se pudo iniciar sesión con Google.");
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoGrupo.trim()) {
      setErrorText('Por favor ingresa un código de acceso de grupo.');
      return;
    }
    if (!whatsappNumber.trim() || whatsappNumber.length < 7) {
      setErrorText('Por favor ingresa un número de teléfono válido.');
      return;
    }

    if (!pendingUser) return;

    try {
      setLoading(true);
      const fullPhone = '+57 ' + whatsappNumber;
      // Guardar en Firestore
      await setDoc(doc(db, 'pm_usuarios', pendingUser.uid), {
        nombre: pendingUser.displayName || 'Usuario',
        email: pendingUser.email,
        foto: pendingUser.photoURL,
        whatsapp: fullPhone,
        codigoGrupo: codigoGrupo.toUpperCase(),
        puntosTotal: 0,
        createdAt: new Date().toISOString()
      });

      onLoginSuccess(
        pendingUser.displayName || 'Usuario', 
        pendingUser.email || '', 
        fullPhone, 
        codigoGrupo.toUpperCase(), 
        pendingUser.uid,
        pendingUser.photoURL || undefined
      );
    } catch (error) {
      console.error("Error guardando perfil", error);
      setErrorText("Ocurrió un error al guardar tu perfil.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#034226] border-solid"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-y-auto px-4 py-8 z-10">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-100"></div>
      <div className="fixed inset-0 -z-10 stadium-mesh opacity-50"></div>

      <div className="relative w-full max-w-[400px] flex flex-col items-center">
        
        <div className="mb-8 text-center animate-float">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-[#034226]/10 blur-2xl rounded-full"></div>
            <div className="relative w-28 h-28 flex items-center justify-center bg-[#034226] rounded-full border-4 border-[#e1b12c] shadow-[0_10px_25px_rgba(3,66,38,0.25)]">
              <span className="material-symbols-outlined text-[56px] text-[#e1b12c]" style={{ fontVariationSettings: "'FILL' 1" }}>
                sports_soccer
              </span>
            </div>
          </div>
          <h1 className="font-display text-5xl text-[#034226] tracking-wider mb-1 leading-none uppercase text-center">
            GOLI <br/> POLLA MUNDIALISTA
          </h1>
        </div>

        {!showCompleteProfile ? (
          <div className="w-full bg-white rounded-2xl p-6 flex flex-col gap-5 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <p className="text-center text-slate-500 font-sans text-sm mb-2">
              Ingresa el código de tu grupo para continuar
            </p>
            
            <div className="flex flex-col gap-2">
              <label className="font-sans text-xs font-bold text-slate-500 px-1 uppercase tracking-wider block">
                Código de Acceso (Grupo)
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#034226] transition-colors">
                  group
                </span>
                <input
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#034226] focus:ring-1 focus:ring-[#034226] rounded-xl py-3.5 pl-11 pr-4 font-mono text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
                  placeholder="EJ: CHAMPIONS-2024"
                  type="text"
                  value={codigoGrupo}
                  onChange={(e) => setCodigoGrupo(e.target.value)}
                />
              </div>
            </div>

            {errorText && (
              <p className="text-red-600 text-xs font-semibold px-2 text-center">{errorText}</p>
            )}
            
            <button
              onClick={() => {
                if (!codigoGrupo.trim()) {
                  setErrorText('Ingresa un código de grupo primero (o intenta entrar si ya tienes cuenta).');
                  handleGoogleLogin();
                } else {
                  handleGoogleLogin();
                }
              }}
              className="w-full bg-[#034226] hover:bg-[#02331d] text-white font-sans text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer shadow-md duration-300"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
              </svg>
              <span>Acceder con Google</span>
            </button>
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl p-6 flex flex-col gap-5 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] animate-in fade-in zoom-in">
            <div className="text-center mb-2">
              <h2 className="font-display text-2xl text-[#034226] uppercase">Completa tu perfil</h2>
              <p className="text-xs text-slate-500">Solo necesitamos un par de datos más.</p>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Si ya escribieron el codigo de grupo en la pantalla anterior, lo mostramos pre-llenado o lo ocultamos. Lo dejaremos visible pero pre-llenado */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-slate-500 px-1 uppercase tracking-wider block">
                  Código de Grupo
                </label>
                <input
                  required
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#034226] focus:ring-1 focus:ring-[#034226] rounded-xl py-3 px-4 font-mono text-sm text-slate-800 placeholder-slate-400 outline-none"
                  placeholder="EJ: CHAMPIONS-2024"
                  type="text"
                  value={codigoGrupo}
                  onChange={(e) => setCodigoGrupo(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-slate-500 px-1 uppercase tracking-wider block">
                  WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-xs font-bold text-slate-400 border-r border-slate-200 pr-2">
                    +57
                  </span>
                  <input
                    required
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#034226] focus:ring-1 focus:ring-[#034226] rounded-xl py-3 pl-14 pr-4 font-mono text-sm text-slate-800 placeholder-slate-400 outline-none"
                    placeholder="300 000 0000"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>
              </div>

              {errorText && <p className="text-red-600 text-xs font-semibold px-1">{errorText}</p>}

              <button
                type="submit"
                className="w-full bg-[#034226] hover:bg-[#02331d] text-white font-sans font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md cursor-pointer text-sm uppercase mt-4"
              >
                Comenzar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
