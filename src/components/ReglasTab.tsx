import React from 'react';

export default function ReglasTab() {
  return (
    <div className="space-y-6">
      
      {/* Rules Header introduction */}
      <section className="space-y-2">
        <h2 className="font-display text-4xl text-[#e1b12c] uppercase tracking-wider mb-1">
          Reglamento Oficial
        </h2>
        <p className="text-slate-300 font-sans text-sm max-w-2xl leading-relaxed font-medium">
          Domina el campo de juego conociendo el sistema de puntuación. La precisión es la clave fundamental para llegar a la cima de la tabla del grupo.
        </p>
      </section>

      {/* Bento Layout Grid for official regulations */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Scoring list card */}
        <div className="md:col-span-8 bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="absolute top-4 right-4 opacity-[0.03] text-[#034226]">
            <span className="material-symbols-outlined text-[140px]" style={{ fontVariationSettings: "'FILL' 0" }}>
              sports_soccer
            </span>
          </div>

          <h3 className="font-display text-2xl text-[#034226] mb-5 flex items-center gap-2 tracking-wide uppercase">
            <span className="material-symbols-outlined text-[22px] text-[#e1b12c]">scoreboard</span>
            Puntuación por Partido
          </h3>

          <div className="space-y-4">
            
            {/* Exact marcador row */}
            <div className="flex justify-between items-center p-4 bg-[#034226]/5 rounded-xl border-l-4 border-[#034226] shadow-sm">
              <div>
                <p className="font-sans font-bold text-slate-800">Marcador Exacto</p>
                <p className="text-slate-500 text-xs font-sans mt-0.5">Si aciertas la cantidad exacta de goles que hizo cada equipo. <br/><span className="italic">Ejemplo: Apostaste 2-1 y el partido terminó exactamente 2-1.</span></p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="font-display text-4xl text-[#034226] font-bold">5</span>
                <span className="font-sans text-xs text-[#034226] font-extrabold">PTS</span>
              </div>
            </div>

            {/* Winner + Goals row */}
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border-l-4 border-[#e1b12c] shadow-sm">
              <div>
                <p className="font-sans font-bold text-slate-800">Ganador + Goles</p>
                <p className="text-slate-500 text-xs font-sans mt-0.5">Si aciertas al equipo ganador y además aciertas la cantidad exacta de goles que anotó alguno de los dos equipos. <br/><span className="italic">Ejemplo: Apostaste 3-0 y terminó 3-1.</span></p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="font-display text-4xl text-[#e1b12c] font-black">3</span>
                <span className="font-sans text-xs text-[#e1b12c] font-black">PTS</span>
              </div>
            </div>

            {/* Winner row */}
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border-l-4 border-slate-300 shadow-sm">
              <div>
                <p className="font-sans font-bold text-slate-800">Equipo Ganador</p>
                <p className="text-slate-500 text-xs font-sans mt-0.5">Si aciertas quién ganó el partido, o el empate, sin exactitud en goles. <br/><span className="italic">Ejemplo: Apostaste 2-0 y el partido terminó 1-0.</span></p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="font-display text-4xl text-slate-400 font-black">2</span>
                <span className="font-sans text-xs text-slate-400 font-black">PTS</span>
              </div>
            </div>

            {/* Empate Bonus row */}
            <div className="flex justify-between items-center p-4 bg-[#034226]/5 rounded-xl border-l-4 border-[#034226] shadow-sm">
              <div>
                <p className="font-sans font-bold text-slate-800">Empate Acertado (Bonus)</p>
                <p className="text-slate-500 text-xs font-sans mt-0.5">Bonus especial si predices un empate y aciertas que el resultado fue empate, aunque falles el marcador exacto. <br/><span className="italic">Ejemplo: Apostaste 1-1 y terminó 2-2.</span></p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="font-display text-4xl text-[#034226] font-bold">4</span>
                <span className="font-sans text-xs text-[#034226] font-extrabold">PTS</span>
              </div>
            </div>

            {/* Over/Under row */}
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border-l-4 border-[#e1b12c] shadow-sm">
              <div>
                <p className="font-sans font-bold text-slate-800">Total de Goles (Over/Under)</p>
                <p className="text-slate-500 text-xs font-sans mt-0.5">Si apuestas si la suma de goles de ambos equipos será mayor o menor a 2.5 y aciertas. <br/><span className="italic">Ejemplo: Elegiste "+2.5 goles" y el partido terminó 2-1 (Total 3).</span></p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="font-display text-4xl text-[#e1b12c] font-black">2</span>
                <span className="font-sans text-xs text-[#e1b12c] font-black">PTS</span>
              </div>
            </div>

          </div>
        </div>

        {/* Phases summary timeline card */}
        <div className="md:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-display text-2xl text-[#034226] mb-4 flex items-center gap-2 tracking-wide uppercase">
              <span className="material-symbols-outlined text-[22px] text-[#034226]">account_tree</span>
              Fases del Torneo
            </h3>
            <p className="text-slate-500 font-sans text-xs leading-relaxed mb-6 font-medium">
              El torneo se divide en dos fases críticas. Tus predicciones de la Fase 1 deben completarse antes del partido de inicio.
            </p>

            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded bg-[#034226]/10 flex items-center justify-center shrink-0 border border-[#034226]/20">
                  <span className="font-mono font-bold text-xs text-[#034226]">01</span>
                </div>
                <div>
                  <p className="font-sans font-bold text-sm text-slate-800">Fase de Grupos</p>
                  <p className="text-xs text-slate-400 font-medium">Predicción de encuentros ordinarios y cruces.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded bg-[#e1b12c]/10 flex items-center justify-center shrink-0 border border-[#e1b12c]/20">
                  <span className="font-mono font-bold text-xs text-[#e1b12c]">02</span>
                </div>
                <div>
                  <p className="font-sans font-bold text-sm text-slate-800">Eliminatorias</p>
                  <p className="text-xs text-slate-400 font-medium font-sans">Play-offs selectivos, llaves directas y bonos.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-red-600">
              <span className="material-symbols-outlined text-sm font-bold">info</span>
              <span className="font-sans text-[9px] uppercase font-bold tracking-wider">
                CIERRE DE APUESTAS: 1H ANTES DEL PARTIDO
              </span>
            </div>
          </div>
        </div>

        {/* Global Special Tournament Picks (Phase 2 Booster) */}
        <div className="md:col-span-12 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-display text-2xl text-[#034226] mb-5 flex items-center gap-2 uppercase tracking-wide">
            <span className="material-symbols-outlined text-[24px] text-[#e1b12c]" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
            Bonificaciones Especiales (Fase 2)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Champion */}
            <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-between border border-slate-200/60 hover:border-[#e1b12c] transition-all shadow-sm gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#e1b12c]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    trophy
                  </span>
                  <span className="font-sans font-bold text-slate-700 text-sm">Campeón</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-display text-2xl text-[#e1b12c] font-black">+20</span>
                  <span className="font-sans text-[10px] text-[#e1b12c] font-extrabold">PTS</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                Acierta qué selección levantará la copa al final del torneo. Debe seleccionarse antes de que inicien los octavos de final.
              </p>
            </div>

            {/* Top Scorer */}
            <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-between border border-slate-200/60 hover:border-slate-400 transition-all shadow-sm gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#034226]">
                    sports_and_outdoors
                  </span>
                  <span className="font-sans font-bold text-slate-700 text-sm">Goleador (Bota de Oro)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-display text-2xl text-[#034226] font-black">+10</span>
                  <span className="font-sans text-[10px] text-[#034226] font-extrabold">PTS</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                Acierta qué jugador anotará la mayor cantidad de goles en todo el mundial. Válido si se elige antes de iniciar la Fase 2.
              </p>
            </div>

            {/* Best Defense/Valla Invicta */}
            <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-between border border-slate-200/60 hover:border-slate-400 transition-all shadow-sm gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#034226]">
                    shield
                  </span>
                  <span className="font-sans font-bold text-slate-700 text-sm">Valla Invicta</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-display text-2xl text-[#034226] font-black">+10</span>
                  <span className="font-sans text-[10px] text-[#034226] font-extrabold">PTS</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                Acierta el arquero que ganará el Guante de Oro (menos goles recibidos y mejor desempeño general) del torneo.
              </p>
            </div>

            {/* Fair Play bonus */}
            <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-between border border-slate-200/60 hover:border-slate-400 transition-all shadow-sm gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#e1b12c]">
                    style
                  </span>
                  <span className="font-sans font-bold text-slate-700 text-sm">Fair Play</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-display text-2xl text-[#e1b12c] font-black">+5</span>
                  <span className="font-sans text-[10px] text-[#e1b12c] font-extrabold">PTS</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                Acierta qué equipo recibirá el trofeo oficial al Juego Limpio por menor cantidad de tarjetas o faltas graves.
              </p>
            </div>

            {/* Revelación bonus */}
            <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-between border border-slate-200/60 hover:border-slate-400 transition-all shadow-sm gap-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#e1b12c]">
                    stars
                  </span>
                  <span className="font-sans font-bold text-slate-700 text-sm">Equipo Revelación</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-display text-2xl text-[#e1b12c] font-black">+5</span>
                  <span className="font-sans text-[10px] text-[#e1b12c] font-extrabold">PTS</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                Acierta el equipo sorpresa del mundial (generalmente la selección no favorita que llega más lejos en las eliminatorias). El administrador validará el equipo revelación oficial al finalizar.
              </p>
            </div>

          </div>
        </div>
        {/* Premios y Ganadores Card */}
        <div className="md:col-span-12 bg-gradient-to-br from-[#034226] to-[#045c36] border border-[#e1b12c]/40 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-[100px] text-[#e1b12c]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          
          <h3 className="font-display text-2xl text-[#e1b12c] mb-5 flex items-center gap-2 uppercase tracking-wide relative z-10">
            <span className="material-symbols-outlined text-[24px]">emoji_events</span>
            Distribución de Premios
          </h3>
          
          <p className="text-white/80 font-sans text-sm mb-6 max-w-2xl relative z-10">
            Al finalizar el torneo, el pozo acumulado será distribuido entre los 3 mejores pronosticadores de la tabla general, garantizando una competencia emocionante hasta el último partido:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {/* 1er Puesto */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-xl flex flex-col items-center justify-center text-center hover:bg-white/15 transition-all">
              <span className="material-symbols-outlined text-[40px] text-[#e1b12c] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
              <p className="font-sans text-white font-bold text-sm">1er Puesto (Campeón)</p>
              <p className="font-display text-4xl text-[#e1b12c] font-black mt-2">70%</p>
              <p className="font-sans text-[10px] text-white/60 mt-1 uppercase tracking-wider">Del Pozo Acumulado</p>
            </div>

            {/* 2do Puesto */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-xl flex flex-col items-center justify-center text-center hover:bg-white/15 transition-all">
              <span className="material-symbols-outlined text-[32px] text-slate-300 mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              <p className="font-sans text-white font-bold text-sm">2do Puesto (Subcampeón)</p>
              <p className="font-display text-3xl text-slate-300 font-black mt-2">20%</p>
              <p className="font-sans text-[10px] text-white/60 mt-1 uppercase tracking-wider">Del Pozo Acumulado</p>
            </div>

            {/* 3er Puesto */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-xl flex flex-col items-center justify-center text-center hover:bg-white/15 transition-all">
              <span className="material-symbols-outlined text-[32px] text-[#cd7f32] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              <p className="font-sans text-white font-bold text-sm">3er Puesto</p>
              <p className="font-display text-3xl text-[#cd7f32] font-black mt-2">10%</p>
              <p className="font-sans text-[10px] text-white/60 mt-1 uppercase tracking-wider">Del Pozo Acumulado</p>
            </div>
          </div>
        </div>

        {/* Stadium Aesthetic Visual Card */}
        <div className="md:col-span-12 h-52 rounded-2xl relative overflow-hidden border border-slate-200 shadow-lg group">
          <img 
            alt="Atmósfera de Estadio Mundialista" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxWXXcgpr5ymEvY5eu67khstv8NAU63VnyB3GRjLP_TL4N88htFw5chOvZHl3mv4BTpcnL2gjavusrZy-a2tBj0rju_jUJjRGUPw868HirauGZ0DzWrhe8Ry9lIV90HdYY96QYUe3hMf7OoGRYMr6NS97nZpXcHp_1dFBzoC3R1xCao1GkRP8gUl0JocP07lvIx3idcU0ImU6aEXKOQVwG6uBdDeyEnY8Vz6EnEmI1IwuZ4K6UR0PF7uJo3Wu1XEbXXxZ-V3zokAA" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#034226] via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <p className="font-display text-3xl text-[#e1b12c] leading-none mb-1 tracking-wide uppercase">
              LA GLORIA TE ESPERA
            </p>
            <p className="font-sans text-xs text-white uppercase tracking-widest font-bold">
              Sigue las reglas oficiales, mantén la fe y alcanza la cima.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
