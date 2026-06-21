const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const axios = require('axios');
admin.initializeApp();
const db = admin.firestore();

// Secret from firebase functions config
const FOOTBALL_DATA_TOKEN = process.env.FOOTBALLDATA_TOKEN;

const teamNameMapping = {
  "catar": "Qatar", "ecuador": "Ecuador", "senegal": "Senegal", "países bajos": "Netherlands",
  "inglaterra": "England", "irán": "Iran", "estados unidos": "United States", "gales": "Wales",
  "argentina": "Argentina", "arabia saudita": "Saudi Arabia", "méxico": "Mexico", "polonia": "Poland",
  "francia": "France", "australia": "Australia", "dinamarca": "Denmark", "túnez": "Tunisia",
  "españa": "Spain", "costa rica": "Costa Rica", "alemania": "Germany", "japón": "Japan",
  "bélgica": "Belgium", "canadá": "Canada", "marruecos": "Morocco", "croacia": "Croatia",
  "brasil": "Brazil", "serbia": "Serbia", "suiza": "Switzerland", "camerún": "Cameroon",
  "portugal": "Portugal", "ghana": "Ghana", "uruguay": "Uruguay", "corea del sur": "South Korea",
  "haití": "Haiti", "escocia": "Scotland", "turquía": "Turkey", "curazao": "Curaçao",
  "japon": "Japan", "costa de marfil": "Ivory Coast", "suecia": "Sweden",
  "qatar": "Qatar",
  "cabo verde": "Cape Verde Islands", "egipto": "Egypt", "nueva zelanda": "New Zealand",
  "irak": "Iraq", "noruega": "Norway", "argelia": "Algeria", "austria": "Austria",
  "jordania": "Jordan", "rd congo": "DR Congo", "panamá": "Panama", "uzbekistán": "Uzbekistan",
  "colombia": "Colombia", "bosnia": "Bosnia-Herzegovina", "bosnia y herzegovina": "Bosnia-Herzegovina",
  "república checa": "Czechia", "chequia": "Czechia", "paraguay": "Paraguay", "sudáfrica": "South Africa"
};

// ESPN team name mapping (Spanish name → ESPN short name variations)
const espnTeamMapping = {
  "portugal": ["POR", "Portugal"],
  "españa": ["ESP", "Spain"],
  "argentina": ["ARG", "Argentina"],
  "brasil": ["BRA", "Brazil"],
  "francia": ["FRA", "France"],
  "alemania": ["GER", "Germany"],
  "inglaterra": ["ENG", "England"],
  "estados unidos": ["USA", "United States"],
  "méxico": ["MEX", "Mexico"],
  "colombia": ["COL", "Colombia"],
  "uruguay": ["URU", "Uruguay"],
  "marruecos": ["MAR", "Morocco"],
  "países bajos": ["NED", "Netherlands"],
  "bélgica": ["BEL", "Belgium"],
  "croacia": ["CRO", "Croatia"],
  "suiza": ["SUI", "Switzerland"],
  "senegal": ["SEN", "Senegal"],
  "japón": ["JPN", "Japan"],
  "australia": ["AUS", "Australia"],
  "corea del sur": ["KOR", "South Korea"],
  "dinamarca": ["DEN", "Denmark"],
  "serbia": ["SRB", "Serbia"],
  "túnez": ["TUN", "Tunisia"],
  "camerún": ["CMR", "Cameroon"],
  "ecuador": ["ECU", "Ecuador"],
  "polonia": ["POL", "Poland"],
  "ghana": ["GHA", "Ghana"],
  "arabia saudita": ["KSA", "Saudi Arabia"],
  "haití": ["HAI", "Haiti"],
  "escocia": ["SCO", "Scotland"],
  "turquía": ["TUR", "Turkey"],
  "costa rica": ["CRC", "Costa Rica"],
  "catar": ["QAT", "Qatar"],
  "noruega": ["NOR", "Norway"],
  "suecia": ["SWE", "Sweden"],
  "austria": ["AUT", "Austria"],
  "panamá": ["PAN", "Panama"],
  "costa de marfil": ["CIV", "Ivory Coast"],
  "irak": ["IRQ", "Iraq"],
  "argelia": ["ALG", "Algeria"],
  "egipto": ["EGY", "Egypt"],
  "sudáfrica": ["RSA", "South Africa"],
  "rd congo": ["COD", "DR Congo"],
  "nueva zelanda": ["NZL", "New Zealand"],
  "cabo verde": ["CPV", "Cape Verde"],
  "uzbekistán": ["UZB", "Uzbekistan"],
  "paraguay": ["PAR", "Paraguay"],
  "república checa": ["CZE", "Czech Republic"],
  "bosnia y herzegovina": ["BIH", "Bosnia and Herzegovina"],
  "irán": ["IRN", "Iran"],
  "chequia": ["CZE", "Czech Republic"],
  "canadá": ["CAN", "Canada"],
  "bosnia": ["BIH", "Bosnia and Herzegovina"],
  "qatar": ["QAT", "Qatar"],
  "curazao": ["CUW", "Curaçao"],
  "jordania": ["JOR", "Jordan"],
};

// ─────────────────────────────────────────────────────────────────────────────
// API FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fuente 1: football-data.org (API oficial con token)
 * Devuelve array de partidos normalizados: { homeTeam, awayTeam, status, golesLocal, golesVisitante }
 */
async function fetchFromFootballData() {
  if (!FOOTBALL_DATA_TOKEN) {
    console.warn('[FootballData] Token no configurado, saltando.');
    return null;
  }
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const today = yesterdayDate.toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  try {
    const response = await axios.get(
      `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${today}&dateTo=${tomorrow}`,
      { headers: { 'X-Auth-Token': FOOTBALL_DATA_TOKEN }, timeout: 8000 }
    );
    const matches = response.data.matches;
    if (!matches || matches.length === 0) {
      console.warn('[FootballData] La API devolvió 0 partidos.');
      return null;
    }
    console.log(`[FootballData] ✅ ${matches.length} partidos obtenidos.`);
    // Normalize to common format
    return matches.map(m => ({
      homeTeamName: m.homeTeam.name,
      awayTeamName: m.awayTeam.name,
      status: m.status, // 'FINISHED', 'IN_PLAY', 'PAUSED', 'SCHEDULED'
      golesLocal: m.score?.fullTime?.home ?? 0,
      golesVisitante: m.score?.fullTime?.away ?? 0,
      source: 'football-data'
    }));
  } catch (e) {
    console.error('[FootballData] ❌ Error:', e.message);
    return null;
  }
}

/**
 * Fuente 2: ESPN API (no oficial, gratuita, sin key)
 * Devuelve array de partidos normalizados
 */
async function fetchFromESPN() {
  try {
    // ESPN World Cup 2026 endpoint
    const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
    const response = await axios.get(url, { timeout: 8000 });

    const events = response.data.events;
    if (!events || events.length === 0) {
      console.warn('[ESPN] No events found in response.');
      return null;
    }

    const normalized = [];
    for (const event of events) {
      const competition = event.competitions?.[0];
      if (!competition) continue;

      const competitors = competition.competitors;
      const home = competitors.find(c => c.homeAway === 'home');
      const away = competitors.find(c => c.homeAway === 'away');
      if (!home || !away) continue;

      const statusType = competition.status?.type?.name; // 'STATUS_FINAL', 'STATUS_IN_PROGRESS', 'STATUS_SCHEDULED'
      const finished = statusType === 'STATUS_FINAL';
      const inPlay = statusType === 'STATUS_IN_PROGRESS' || statusType === 'STATUS_HALFTIME';

      normalized.push({
        homeTeamName: home.team.displayName,
        homeTeamAbbr: home.team.abbreviation,
        awayTeamName: away.team.displayName,
        awayTeamAbbr: away.team.abbreviation,
        status: finished ? 'FINISHED' : inPlay ? 'IN_PLAY' : 'SCHEDULED',
        golesLocal: finished || inPlay ? parseInt(home.score || '0', 10) : 0,
        golesVisitante: finished || inPlay ? parseInt(away.score || '0', 10) : 0,
        source: 'espn'
      });
    }

    if (normalized.length === 0) {
      console.warn('[ESPN] Partidos parseados: 0');
      return null;
    }

    console.log(`[ESPN] ✅ ${normalized.length} partidos obtenidos.`);
    return normalized;
  } catch (e) {
    console.error('[ESPN] ❌ Error:', e.message);
    return null;
  }
}

/**
 * Busca un partido de la API que coincida con un partido de Firestore.
 * Intenta varias estrategias de matching.
 */
function findMatchInAPIResults(p, apiMatches) {
  const localLow = p.equipoLocal.toLowerCase();
  const visitanteLow = p.equipoVisitante.toLowerCase();
  const englishHome = teamNameMapping[localLow] || p.equipoLocal;
  const englishAway = teamNameMapping[visitanteLow] || p.equipoVisitante;

  // Estrategia 1: coincidencia exacta por nombre en inglés
  let found = apiMatches.find(m =>
    m.homeTeamName === englishHome && m.awayTeamName === englishAway
  );
  if (found) return found;

  // Estrategia 2: coincidencia parcial (includes) case insensitive
  found = apiMatches.find(m =>
    m.homeTeamName.toLowerCase().includes(englishHome.toLowerCase()) &&
    m.awayTeamName.toLowerCase().includes(englishAway.toLowerCase())
  );
  if (found) return found;

  // Estrategia 3: por abreviatura ESPN
  const homeAbbrs = espnTeamMapping[localLow] || [];
  const awayAbbrs = espnTeamMapping[visitanteLow] || [];
  if (homeAbbrs.length > 0 && awayAbbrs.length > 0) {
    found = apiMatches.find(m =>
      (homeAbbrs.includes(m.homeTeamAbbr) || homeAbbrs.some(a => m.homeTeamName?.toLowerCase().includes(a.toLowerCase()))) &&
      (awayAbbrs.includes(m.awayTeamAbbr) || awayAbbrs.some(a => m.awayTeamName?.toLowerCase().includes(a.toLowerCase())))
    );
    if (found) return found;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Cron Job: checkAndScoreMatches (cada 5 minutos)
// ─────────────────────────────────────────────────────────────────────────────
exports.checkAndScoreMatches = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('America/Bogota')
  .onRun(async (context) => {

    // Load partidos from local json definition
    let partidosDef = [];
    try {
      partidosDef = require('./partidos.json');
    } catch (e) {
      console.warn('No se pudo cargar partidos.json:', e.message);
    }

    // Fetch all matches from firestore
    const snapshot = await db.collection('pm_partidos').get();
    const existingIds = new Set();
    snapshot.forEach(doc => existingIds.add(doc.id));

    // Auto-create missing matches in Firestore
    const missingPartidos = partidosDef.filter(p => !existingIds.has(p.partidoId));
    let currentSnapshot = snapshot;
    if (missingPartidos.length > 0) {
      console.log(`[Cron] Se detectaron ${missingPartidos.length} partidos faltantes en Firestore. Creándolos...`);
      const batch = db.batch();
      for (const p of missingPartidos) {
        batch.set(db.collection('pm_partidos').doc(p.partidoId), p);
      }
      await batch.commit();
      console.log(`[Cron] ✅ ${missingPartidos.length} partidos creados exitosamente.`);
      currentSnapshot = await db.collection('pm_partidos').get();
    }

    const activeDocs = currentSnapshot.docs.filter(doc => {
      const p = doc.data();
      // Si ya está finalizado y TIENE goles, no hay que hacer nada.
      if (p.estado === 'finalizado' && p.golesLocal !== null && p.golesLocal !== undefined) {
        return false;
      }
      if (!p.fecha || !p.hora) return false;
      try {
        const parts = p.fecha.split(' ');
        if (parts.length < 2) return false;
        const [day, month] = parts[1].split('-');
        const year = 2026;

        let [time, modifier] = p.hora.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

        const startTime = new Date(`${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes}:00-05:00`);
        return startTime <= new Date();
      } catch (e) {
        return false;
      }
    });

    if (activeDocs.length === 0) {
      console.log('No hay partidos activos en este momento.');
      await sincronizarApuestasPendientes();
      return null;
    }

    console.log(`[Cron] ${activeDocs.length} partido(s) pendiente(s) de revisión.`);

    // ── Cascada de APIs ──────────────────────────────────────────────────────
    const footballDataMatches = await fetchFromFootballData();
    let espnMatches = null;

    if (!footballDataMatches) {
      console.log('[Cron] football-data.org no disponible, cargando ESPN...');
      espnMatches = await fetchFromESPN();
    }

    if (!footballDataMatches && !espnMatches) {
      console.error('[Cron] ❌ Todas las APIs fallaron. No se puede actualizar resultados.');
      return null;
    }

    // ── Procesar cada partido activo ─────────────────────────────────────────
    for (const docSnap of activeDocs) {
      const p = docSnap.data();

      let matchFound = footballDataMatches ? findMatchInAPIResults(p, footballDataMatches) : null;
      let usedSource = 'football-data.org';

      if (!matchFound) {
        if (!espnMatches) {
          espnMatches = await fetchFromESPN();
        }
        if (espnMatches) {
          matchFound = findMatchInAPIResults(p, espnMatches);
          usedSource = 'ESPN';
        }
      }

      if (!matchFound) {
        console.warn(`[Cron] ⚠️ No se encontró en la API: ${p.equipoLocal} vs ${p.equipoVisitante}`);
        continue;
      }

      const finalizado = matchFound.status === 'FINISHED';
      const enVivo = matchFound.status === 'IN_PLAY' || matchFound.status === 'PAUSED';

      if (!finalizado && !enVivo) {
        console.log(`[Cron] ${p.equipoLocal} vs ${p.equipoVisitante} → SCHEDULED, sin acción.`);
        continue;
      }

      const golesLocal = matchFound.golesLocal;
      const golesVisitante = matchFound.golesVisitante;
      const marcadorCambio = p.golesLocal !== golesLocal || p.golesVisitante !== golesVisitante;

      console.log(`[Cron] ${p.equipoLocal} ${golesLocal}-${golesVisitante} ${p.equipoVisitante} [${matchFound.status}] (${usedSource})`);

      await docSnap.ref.set({
        golesLocal,
        golesVisitante,
        estado: finalizado ? 'finalizado' : 'en_vivo'
      }, { merge: true });
    }

    await sincronizarApuestasPendientes();

    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// Lógica de cálculo de puntos
// ─────────────────────────────────────────────────────────────────────────────
function calcularPuntosPartido(golesLocalReal, golesVisitanteReal, golesLocalApuesta, golesVisitanteApuesta, totalGolesApuesta) {
  let marcador = 0;
  let ganador = 0;
  let empate = 0;
  let totalGoles = 0;

  const ganadorReal = golesLocalReal > golesVisitanteReal ? "local" : golesLocalReal < golesVisitanteReal ? "visitante" : "empate";
  const ganadorApuesta = golesLocalApuesta > golesVisitanteApuesta ? "local" : golesLocalApuesta < golesVisitanteApuesta ? "visitante" : "empate";

  const acertoGolesLocal = golesLocalReal === golesLocalApuesta;
  const acertoGolesVisitante = golesVisitanteReal === golesVisitanteApuesta;

  // 1. Marcador Exacto
  if (golesLocalReal === golesLocalApuesta && golesVisitanteReal === golesVisitanteApuesta) {
    marcador = 5;
  }
  // 2. Ganador + Goles
  else if (ganadorReal === ganadorApuesta && (acertoGolesLocal || acertoGolesVisitante) && ganadorReal !== "empate") {
    ganador = 3;
  }
  // 3. Solo ganador
  else if (ganadorReal === ganadorApuesta && ganadorReal !== "empate") {
    ganador = 2;
  }

  // 4. Empate Acertado
  if (ganadorReal === "empate" && ganadorApuesta === "empate") {
    if (marcador === 0) {
      empate = 4;
    }
  }

  // 5. Total goles Over/Under
  const totalGolesReal = golesLocalReal + golesVisitanteReal;
  if (totalGolesApuesta === "mas25" && totalGolesReal > 2.5) {
    totalGoles = 2;
  } else if (totalGolesApuesta === "menos25" && totalGolesReal < 2.5) {
    totalGoles = 2;
  }

  const total = marcador + ganador + empate + totalGoles;
  return { marcador, ganador, empate, totalGoles, total };
}

async function calcularYGuardarPuntos(partidoId, partidoActualizado) {
  const apuestasSnap = await db.collection('pm_apuestas')
    .where('partidoId', '==', partidoId)
    .get();

  if (apuestasSnap.empty) {
    console.log(`[Puntos] No hay apuestas para ${partidoId}`);
    return;
  }

  const batch = db.batch();
  const userPointsDiff = {};
  const matchPoints = {};

  apuestasSnap.docs.forEach(apuestaDoc => {
    const a = apuestaDoc.data();

    const ptsObj = calcularPuntosPartido(
      partidoActualizado.golesLocal,
      partidoActualizado.golesVisitante,
      a.golesLocalApuesta,
      a.golesVisitanteApuesta,
      a.totalGolesApuesta
    );

    const ptsTotal = ptsObj.total;
    const ptsAnteriores = typeof a.puntosObtenidos === 'number'
      ? a.puntosObtenidos
      : (a.puntosObtenidos?.total || 0);

    const grupo = a.codigoGrupo || 'LACURVA1';
    if (!matchPoints[a.uid]) matchPoints[a.uid] = {};
    matchPoints[a.uid][grupo] = ptsTotal;

    // Usar set+merge en vez de update para evitar "No document to update"
    batch.set(apuestaDoc.ref, { puntosObtenidos: ptsObj }, { merge: true });

    if (ptsTotal !== ptsAnteriores) {
      const diff = ptsTotal - ptsAnteriores;
      if (!userPointsDiff[a.uid]) userPointsDiff[a.uid] = { total: 0, byGroup: {} };
      userPointsDiff[a.uid].total += diff;

      const grupo = a.codigoGrupo || 'LACURVA1';
      userPointsDiff[a.uid].byGroup[grupo] = (userPointsDiff[a.uid].byGroup[grupo] || 0) + diff;
    }
  });

  // Update total points for users — también con set+merge
  for (const uid of Object.keys(userPointsDiff)) {
    const diffs = userPointsDiff[uid];
    if (diffs.total !== 0) {
      const userRef = db.collection('pm_usuarios').doc(uid);
      const updateData = {
        puntosTotal: admin.firestore.FieldValue.increment(diffs.total)
      };
      for (const g of Object.keys(diffs.byGroup)) {
        updateData[`puntosPorGrupo.${g}`] = admin.firestore.FieldValue.increment(diffs.byGroup[g]);
      }
      batch.update(userRef, updateData);
    }
  }

  await batch.commit();
  console.log(`[Puntos] ✅ Puntos guardados para ${partidoActualizado.equipoLocal} vs ${partidoActualizado.equipoVisitante}. ${Object.keys(matchPoints).length} apuestas procesadas.`);

  await emitirNotificacionesPuntos(partidoActualizado.equipoLocal, partidoActualizado.equipoVisitante, matchPoints);
}

/** Recalcula partidos finalizados cuyas apuestas aún tienen puntosObtenidos como número. */
async function sincronizarApuestasPendientes() {
  const partidosSnap = await db.collection('pm_partidos').where('estado', '==', 'finalizado').get();
  const partidosMap = {};
  partidosSnap.forEach(d => { partidosMap[d.id] = d.data(); });

  const apuestasSnap = await db.collection('pm_apuestas').get();
  const partidosPorRecalcular = new Set();

  apuestasSnap.forEach(doc => {
    const a = doc.data();
    const partido = partidosMap[a.partidoId];
    if (!partido || partido.golesLocal === null || partido.golesLocal === undefined) return;
    if (typeof a.puntosObtenidos === 'number') {
      partidosPorRecalcular.add(a.partidoId);
    }
  });

  for (const partidoId of partidosPorRecalcular) {
    const partido = partidosMap[partidoId];
    console.log(`[Puntos] Sincronizando apuestas pendientes de ${partidoId} (${partido.equipoLocal} vs ${partido.equipoVisitante})`);
    await calcularYGuardarPuntos(partidoId, partido);
  }
}

async function emitirNotificacionesPuntos(equipoLocal, equipoVisitante, matchPoints) {
  const uids = Object.keys(matchPoints);
  if (uids.length === 0) return;

  const allUsers = [];
  for (let i = 0; i < uids.length; i += 30) {
    const chunk = uids.slice(i, i + 30);
    const snap = await db.collection('pm_usuarios').where(admin.firestore.FieldPath.documentId(), 'in', chunk).get();
    snap.forEach(d => allUsers.push({ id: d.id, ...d.data() }));
  }

  const messages = [];
  allUsers.forEach(user => {
    const token = user.fcmToken;
    if (token && user.notificationsEnabled !== false) {
      const userGroupsPoints = matchPoints[user.id] || {};
      const groups = Object.keys(userGroupsPoints);
      
      const title = "¡Partido Finalizado!";
      let body = "";

      if (groups.length === 1) {
        const pts = userGroupsPoints[groups[0]];
        body = pts > 0
          ? `Has ganado ${pts} puntos en ${equipoLocal} vs ${equipoVisitante}.`
          : `No has ganado puntos en ${equipoLocal} vs ${equipoVisitante}. ¡Suerte en el próximo!`;
      } else if (groups.length > 1) {
        const parts = groups.map(g => `${g}: +${userGroupsPoints[g]} pts`);
        body = `Tus puntos en ${equipoLocal} vs ${equipoVisitante}: ` + parts.join(', ');
      } else {
        body = `No has ganado puntos en ${equipoLocal} vs ${equipoVisitante}. ¡Suerte en el próximo!`;
      }

      messages.push({ notification: { title, body }, token });
    }
  });

  if (messages.length > 0) {
    try {
      const response = await admin.messaging().sendEach(messages);
      console.log(`[Notif] ${response.successCount} enviadas, ${response.failureCount} fallidas.`);
    } catch (e) {
      console.error("[Notif] Error enviando notificaciones:", e);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Cron Job: sendMatchReminders (cada 15 minutos)
// ─────────────────────────────────────────────────────────────────────────────
exports.sendMatchReminders = functions.pubsub
  .schedule('every 15 minutes')
  .timeZone('America/Bogota')
  .onRun(async (context) => {
    const snapshot = await db.collection('pm_partidos').get();
    const now = new Date();

    const upcomingMatches = [];
    snapshot.forEach(doc => {
      const p = doc.data();
      if (!p.fecha || !p.hora || p.estado === 'finalizado') return;
      try {
        const parts = p.fecha.split(' ');
        if (parts.length < 2) return;
        const [day, month] = parts[1].split('-');
        const year = 2026;

        let [time, modifier] = p.hora.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

        const startTime = new Date(`${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes}:00-05:00`);

        const diffMs = startTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        const is12h = diffHours > 11.75 && diffHours <= 12.0;
        const is2h = diffHours > 1.75 && diffHours <= 2.0;
        const is1h = diffHours > 0.75 && diffHours <= 1.0;

        if (is12h) upcomingMatches.push({ ...p, hoursLeft: 12 });
        else if (is2h) upcomingMatches.push({ ...p, hoursLeft: 2 });
        else if (is1h) upcomingMatches.push({ ...p, hoursLeft: 1 });
      } catch (e) {
        // Ignore parsing errors for this match
      }
    });

    if (upcomingMatches.length === 0) {
      console.log('No matches requiring reminders at this time.');
      return null;
    }

    const usersSnap = await db.collection('pm_usuarios').get();
    const tokens = [];
    usersSnap.forEach(u => {
      const userData = u.data();
      const token = userData.fcmToken;
      if (token && userData.notificationsEnabled !== false) {
        tokens.push(token);
      }
    });

    if (tokens.length === 0) {
      console.log('No users with FCM tokens found.');
      return null;
    }

    const messages = [];
    upcomingMatches.forEach(match => {
      let title = `¡El partido comienza en ${match.hoursLeft} horas!`;
      if (match.hoursLeft === 1) title = '¡El partido comienza en 1 hora!';

      const body = `¡No olvides hacer tu apuesta! ${match.equipoLocal} vs ${match.equipoVisitante}`;

      messages.push(admin.messaging().sendEachForMulticast({
        notification: { title, body },
        tokens,
      }));
    });

    try {
      const responses = await Promise.all(messages);
      let successCount = 0;
      responses.forEach(r => successCount += r.successCount);
      console.log(`Sent reminders for ${upcomingMatches.length} matches. Delivered to ${successCount} devices.`);
    } catch (e) {
      console.error("Error sending push notifications", e);
    }
    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 6. HTTP: sendTestNotification
// ─────────────────────────────────────────────────────────────────────────────
exports.sendTestNotification = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const userDoc = await db.collection('pm_usuarios').doc(decodedToken.uid).get();
    if (!userDoc.exists || (!userDoc.data().esAdmin && userDoc.data().email !== 'lfalzatel@gmail.com')) {
      res.status(403).send({ error: 'Forbidden' });
      return;
    }

    const usersSnap = await db.collection('pm_usuarios').get();
    const tokens = [];
    usersSnap.forEach(u => {
      const userData = u.data();
      const token = userData.fcmToken;
      if (token && userData.notificationsEnabled !== false) {
        tokens.push(token);
      }
    });

    if (tokens.length === 0) {
      res.status(200).send({ result: { success: false, message: 'No tokens found' } });
      return;
    }

    const message = {
      notification: {
        title: '¡Notificación de Prueba!',
        body: 'Si ves esto, el sistema de notificaciones globales está funcionando perfectamente.',
      },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    res.status(200).send({ result: { success: true, delivered: response.successCount } });

  } catch (e) {
    console.error("Error en sendTestNotification:", e);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Callable: sendMatchResultsNotification
// ─────────────────────────────────────────────────────────────────────────────
exports.sendMatchResultsNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Autenticación requerida.');
  }

  const { equipoLocal, equipoVisitante, matchPoints } = data;
  if (!equipoLocal || !equipoVisitante || !matchPoints) {
    throw new functions.https.HttpsError('invalid-argument', 'Faltan parámetros requeridos.');
  }

  const userDoc = await db.collection('pm_usuarios').doc(context.auth.uid).get();
  if (!userDoc.exists || (!userDoc.data().esAdmin && userDoc.data().email !== 'lfalzatel@gmail.com')) {
    throw new functions.https.HttpsError('permission-denied', 'Solo administradores pueden enviar notificaciones de resultados.');
  }

  await emitirNotificacionesPuntos(equipoLocal, equipoVisitante, matchPoints);
  return { success: true };
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. HTTP: fixApuestasNumero - Reparar apuestas con puntosObtenidos NUMBER
// ─────────────────────────────────────────────────────────────────────────────
function calcularPuntosPartidoFix(golesLocalReal, golesVisitanteReal, golesLocalApuesta, golesVisitanteApuesta, totalGolesApuesta) {
  let marcador = 0;
  let ganador = 0;
  let empate = 0;
  let totalGoles = 0;

  const ganadorReal = golesLocalReal > golesVisitanteReal ? "local" : golesLocalReal < golesVisitanteReal ? "visitante" : "empate";
  const ganadorApuesta = golesLocalApuesta > golesVisitanteApuesta ? "local" : golesLocalApuesta < golesVisitanteApuesta ? "visitante" : "empate";

  const acertoGolesLocal = golesLocalReal === golesLocalApuesta;
  const acertoGolesVisitante = golesVisitanteReal === golesVisitanteApuesta;

  if (golesLocalReal === golesLocalApuesta && golesVisitanteReal === golesVisitanteApuesta) {
    marcador = 5;
  } else if (ganadorReal === ganadorApuesta && (acertoGolesLocal || acertoGolesVisitante) && ganadorReal !== "empate") {
    ganador = 3;
  } else if (ganadorReal === ganadorApuesta && ganadorReal !== "empate") {
    ganador = 2;
  }

  if (ganadorReal === "empate" && ganadorApuesta === "empate") {
    if (marcador === 0) {
      empate = 4;
    }
  }

  const totalGolesReal = golesLocalReal + golesVisitanteReal;
  if (totalGolesApuesta === "mas25" && totalGolesReal > 2.5) {
    totalGoles = 2;
  } else if (totalGolesApuesta === "menos25" && totalGolesReal < 2.5) {
    totalGoles = 2;
  }

  const total = marcador + ganador + empate + totalGoles;

  return {
    marcador,
    ganador,
    empate,
    totalGoles,
    total
  };
}

exports.fixApuestasNumero = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST, GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(204).send('');
    return;
  }

  try {
    // Validación simple
    if (req.query.admin !== 'true') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    console.log('\n✅ INICIANDO FIX DE APUESTAS\n');

    const stats = {
      totalApuestas: 0,
      conNumero: 0,
      conObjeto: 0,
      reparadas: 0,
      errores: 0,
      detalles: []
    };

    // 1. Obtener todos los partidos
    console.log('📋 Cargando partidos...');
    const partidosSnap = await db.collection('pm_partidos').get();
    const partidos = {};
    
    partidosSnap.forEach(doc => {
      partidos[doc.id] = doc.data();
    });
    console.log(`✅ ${Object.keys(partidos).length} partidos cargados`);

    // 2. Obtener todas las apuestas
    console.log('📋 Analizando apuestas...');
    const apuestasSnap = await db.collection('pm_apuestas').get();
    stats.totalApuestas = apuestasSnap.size;

    const batch = db.batch();
    let batchCount = 0;
    const batchSize = 500;

    // 3. Procesar cada apuesta
    apuestasSnap.forEach(doc => {
      const apuesta = doc.data();
      const tipoActual = typeof apuesta.puntosObtenidos;

      if (tipoActual === 'object' && apuesta.puntosObtenidos !== null) {
        stats.conObjeto++;
        return;
      }

      if (tipoActual === 'number') {
        stats.conNumero++;
        
        // ✅ Solo procesar si el partido FINALIZÓ
        const partido = partidos[apuesta.partidoId];
        if (!partido || partido.estado !== 'finalizado' || partido.golesLocal === null) {
          console.log(`⚠️  Saltando ${apuesta.uid}/${apuesta.partidoId}: partido no finalizado`);
          stats.detalles.push({
            uid: apuesta.uid,
            partidoId: apuesta.partidoId,
            estado: 'SALTADO - partido no finalizado'
          });
          return;
        }

        try {
          // 🔧 Recalcular
          const ptsObj = calcularPuntosPartidoFix(
            partido.golesLocal,
            partido.golesVisitante,
            apuesta.golesLocalApuesta,
            apuesta.golesVisitanteApuesta,
            apuesta.totalGolesApuesta
          );

          // ✅ Actualizar apuesta
          batch.update(doc.ref, {
            puntosObtenidos: ptsObj
          });

          stats.reparadas++;
          stats.detalles.push({
            uid: apuesta.uid,
            partidoId: apuesta.partidoId,
            estado: 'REPARADA',
            puntosAntiguos: apuesta.puntosObtenidos,
            puntosNuevos: ptsObj
          });

          batchCount++;

          // 4. Commit cada 500
          if (batchCount >= batchSize) {
            batch.commit();
            batchCount = 0;
          }

        } catch (error) {
          stats.errores++;
          stats.detalles.push({
            uid: apuesta.uid,
            partidoId: apuesta.partidoId,
            estado: 'ERROR: ' + error.message
          });
          console.error(`❌ Error: ${error.message}`);
        }
      }
    });

    // 5. Commit final
    if (batchCount > 0) {
      await batch.commit();
    }

    // 6. Respuesta
    res.json({
      success: true,
      stats: {
        total: stats.totalApuestas,
        conObjeto: stats.conObjeto,
        conNumero: stats.conNumero,
        reparadas: stats.reparadas,
        errores: stats.errores
      },
      detalles: stats.detalles.slice(0, 50)
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. HTTP: verificarGeigerP21 - Verificar apuesta de Geiger en p21
// ─────────────────────────────────────────────────────────────────────────────
exports.verificarGeigerP21 = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    console.log('\n🔍 VERIFICANDO CASO DE GEIGER EN P21\n');

    // UID de Geiger
    const geigerUID = '2fwWKHeKsQcsyfFcHIrENGFBST02';

    // 1. Obtener p21
    const p21Doc = await db.collection('pm_partidos').doc('p21').get();
    if (!p21Doc.exists) {
      return res.json({ error: 'P21 no existe' });
    }
    const p21 = p21Doc.data();

    // 2. Buscar TODAS las apuestas de Geiger para ver estructura
    console.log('🔍 Buscando todas las apuestas de Geiger...');
    const allGeigerApuestas = await db.collection('pm_apuestas')
      .where('uid', '==', geigerUID)
      .get();
    
    console.log(`✅ Geiger tiene ${allGeigerApuestas.size} apuestas`);
    
    // 3. Buscar específicamente en p21
    let p21Apuesta = null;
    let p21ApuestaDocId = null;
    
    allGeigerApuestas.forEach(doc => {
      if (doc.data().partidoId === 'p21') {
        p21Apuesta = doc.data();
        p21ApuestaDocId = doc.id;
        console.log(`✅ Encontrada apuesta en p21, docId: ${doc.id}`);
      }
    });

    if (!p21Apuesta) {
      // Intentar formato alternativo
      const docId1 = `${geigerUID}_p21`;
      const docId2 = `p21_${geigerUID}`;
      const doc1 = await db.collection('pm_apuestas').doc(docId1).get();
      const doc2 = await db.collection('pm_apuestas').doc(docId2).get();
      
      if (doc1.exists) {
        p21Apuesta = doc1.data();
        p21ApuestaDocId = docId1;
      } else if (doc2.exists) {
        p21Apuesta = doc2.data();
        p21ApuestaDocId = docId2;
      }
    }

    if (!p21Apuesta) {
      return res.json({
        error: 'No se encontró apuesta de Geiger en p21',
        diagnostico: {
          totalApuestasGeiger: allGeigerApuestas.size,
          apuestasEncontradas: allGeigerApuestas.docs.map(d => ({
            id: d.id,
            partidoId: d.data().partidoId
          }))
        }
      });
    }

    // 4. Verificar resultado
    const totalGolesReal = p21.golesLocal + p21.golesVisitante;
    const totalGolesApuesta = p21Apuesta.totalGolesApuesta;
    
    // ¿Debería ganar 2 puntos?
    let deberíaGanar2Pts = false;
    if (totalGolesApuesta === 'menos25' && totalGolesReal < 2.5) {
      deberíaGanar2Pts = true;
    } else if (totalGolesApuesta === 'mas25' && totalGolesReal > 2.5) {
      deberíaGanar2Pts = true;
    }

    // 5. Revisar qué tiene actualmente
    const puntosObtenidosActual = p21Apuesta.puntosObtenidos;
    let tieneLosPuntos = false;
    if (typeof puntosObtenidosActual === 'object' && puntosObtenidosActual.totalGoles >= 2) {
      tieneLosPuntos = true;
    }

    const resultado = {
      usuario: {
        uid: geigerUID,
        nombre: 'Geiger'
      },
      p21: {
        resultado: `${p21.equipoLocal} ${p21.golesLocal}-${p21.golesVisitante} ${p21.equipoVisitante}`,
        totalGolesReal,
        estado: p21.estado
      },
      apuestaGeiger: {
        docId: p21ApuestaDocId,
        apuesta: `${p21Apuesta.golesLocalApuesta}-${p21Apuesta.golesVisitanteApuesta}`,
        totalGolesApuesta,
        puntosObtenidosType: typeof puntosObtenidosActual,
        puntosObtenidosValue: puntosObtenidosActual
      },
      analisis: {
        deberíaGanar2PtsPorTotalGoles: deberíaGanar2Pts,
        tieneLosPuntosActualmente: tieneLosPuntos,
        problema: deberíaGanar2Pts && !tieneLosPuntos ? 'SÍ - Los 2 puntos no están incluidos' : 'NO - Está correcto o no debería tener puntos',
        detalleCalculo: {
          totalGolesApuesta,
          totalGolesReal,
          condicion: totalGolesApuesta === 'menos25' ? `${totalGolesReal} < 2.5` : `${totalGolesReal} > 2.5`,
          aplica: deberíaGanar2Pts
        }
      }
    };

    res.json(resultado);

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. HTTP: diagnosticarP21 - Diagnosticar todas las apuestas de p21
// ─────────────────────────────────────────────────────────────────────────────
exports.diagnosticarP21 = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    console.log('\n🔍 DIAGNOSTICANDO TODAS LAS APUESTAS DE P21\n');

    // UID de Geiger
    const geigerUID = '2fwWKHeKsQcsyfFcHIrENGFBST02';

    // 1. Obtener p21
    const p21Doc = await db.collection('pm_partidos').doc('p21').get();
    if (!p21Doc.exists) {
      return res.json({ error: 'P21 no existe' });
    }
    const p21 = p21Doc.data();
    const totalGolesReal = p21.golesLocal + p21.golesVisitante;

    // 2. Obtener TODAS las apuestas de Geiger
    const allGeigerApuestas = await db.collection('pm_apuestas')
      .where('uid', '==', geigerUID)
      .get();

    console.log(`✅ Geiger tiene ${allGeigerApuestas.size} apuestas totales`);

    // 3. Filtrar solo p21
    const p21Apuestas = [];
    allGeigerApuestas.forEach(doc => {
      if (doc.data().partidoId === 'p21') {
        p21Apuestas.push({
          docId: doc.id,
          data: doc.data()
        });
      }
    });

    console.log(`✅ Geiger tiene ${p21Apuestas.length} apuesta(s) en p21`);

    // 4. Buscar directamente todas las apuestas de p21
    console.log('\n📋 Buscando TODAS las apuestas de p21 para verificar integridad...');
    const allP21Apuestas = await db.collection('pm_apuestas')
      .where('partidoId', '==', 'p21')
      .get();

    console.log(`✅ Total de apuestas en p21: ${allP21Apuestas.size}`);

    // 5. Agrupar por usuario
    const p21PorUsuario = {};
    allP21Apuestas.forEach(doc => {
      const apuesta = doc.data();
      const uid = apuesta.uid;
      if (!p21PorUsuario[uid]) {
        p21PorUsuario[uid] = [];
      }
      p21PorUsuario[uid].push({
        docId: doc.id,
        totalGolesApuesta: apuesta.totalGolesApuesta,
        puntosObtenidos: apuesta.puntosObtenidos
      });
    });

    // 6. Buscar inconsistencias
    const inconsistencias = [];
    for (const uid in p21PorUsuario) {
      const apuestas = p21PorUsuario[uid];
      if (apuestas.length > 1) {
        // Usuario tiene múltiples apuestas
        inconsistencias.push({
          tipo: 'DUPLICADO',
          uid,
          cantidad: apuestas.length,
          apuestas
        });
      }
    }

    // 7. Verificar específicamente a Geiger
    const apuestasDeGeiger = p21PorUsuario[geigerUID] || [];
    
    const resultado = {
      p21: {
        resultado: `${p21.equipoLocal} ${p21.golesLocal}-${p21.golesVisitante} ${p21.equipoVisitante}`,
        totalGolesReal,
        estado: p21.estado
      },
      geiger: {
        uid: geigerUID,
        totalApuestasEnP21: apuestasDeGeiger.length,
        apuestas: apuestasDeGeiger
      },
      estadisticas: {
        totalApuestasP21: allP21Apuestas.size,
        usuariosConDuplicados: inconsistencias.length,
        detalleInconsistencias: inconsistencias
      }
    };

    res.json(resultado);

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. HTTP: buscarMenos25 - Buscar TODAS las apuestas de Geiger con "menos25"
// ─────────────────────────────────────────────────────────────────────────────
exports.buscarMenos25 = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    console.log('\n🔍 BUSCANDO TODAS LAS APUESTAS CON "menos25"\n');

    const geigerUID = '2fwWKHeKsQcsyfFcHIrENGFBST02';

    // 1. Obtener TODAS las apuestas de Geiger
    const allGeigerApuestas = await db.collection('pm_apuestas')
      .where('uid', '==', geigerUID)
      .get();

    console.log(`✅ Geiger tiene ${allGeigerApuestas.size} apuestas totales`);

    // 2. Buscar que tengan "menos25"
    const conMenos25 = [];
    allGeigerApuestas.forEach(doc => {
      const apuesta = doc.data();
      if (apuesta.totalGolesApuesta === 'menos25') {
        conMenos25.push({
          docId: doc.id,
          partidoId: apuesta.partidoId,
          totalGolesApuesta: apuesta.totalGolesApuesta,
          golesLocalApuesta: apuesta.golesLocalApuesta,
          golesVisitanteApuesta: apuesta.golesVisitanteApuesta,
          puntosObtenidos: apuesta.puntosObtenidos
        });
      }
    });

    // 3. Buscar específicamente en p21 si hay "menos25"
    const p21ConMenos25 = conMenos25.filter(a => a.partidoId === 'p21');

    // 4. Obtener TODAS las apuestas con "menos25" de p21
    const todasP21ConMenos25 = [];
    const allP21Apuestas = await db.collection('pm_apuestas')
      .where('partidoId', '==', 'p21')
      .get();
    
    allP21Apuestas.forEach(doc => {
      if (doc.data().totalGolesApuesta === 'menos25') {
        todasP21ConMenos25.push({
          uid: doc.data().uid,
          docId: doc.id,
          totalGolesApuesta: doc.data().totalGolesApuesta
        });
      }
    });

    const resultado = {
      geiger: {
        uid: geigerUID,
        totalApuestas: allGeigerApuestas.size,
        conMenos25: conMenos25.length,
        p21ConMenos25: p21ConMenos25.length,
        detalleConMenos25: conMenos25
      },
      p21Analisis: {
        totalApuestasP21: allP21Apuestas.size,
        conMenos25: todasP21ConMenos25.length,
        usuariosConMenos25: todasP21ConMenos25
      }
    };

    res.json(resultado);

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. HTTP: corregirTotalGolesP21 - Corregir totalGolesApuesta invertido en p21
// ─────────────────────────────────────────────────────────────────────────────
exports.corregirTotalGolesP21 = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    if (req.query.admin !== 'true') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    console.log('\n🔧 ANALIZANDO totalGolesApuesta EN P21\n');

    // P21: Portugal 1-1 RD Congo = 2 goles totales (menos de 2.5)
    // Si alguien apostó "mas25" = FALLÓ (necesita 0 puntos totalGoles)
    // Si alguien apostó "menos25" = ACERTÓ (necesita 2 puntos totalGoles)

    const stats = {
      revisadas: 0,
      conMenos25: [],
      conMas25: []
    };

    // 1. Obtener TODAS las apuestas de p21
    const allP21Apuestas = await db.collection('pm_apuestas')
      .where('partidoId', '==', 'p21')
      .get();

    // 2. Analizar cada apuesta
    allP21Apuestas.forEach(doc => {
      const apuesta = doc.data();
      stats.revisadas++;

      if (apuesta.totalGolesApuesta === 'menos25') {
        stats.conMenos25.push({
          uid: apuesta.uid,
          docId: doc.id,
          totalGolesApuesta: apuesta.totalGolesApuesta,
          puntosObtenidos: apuesta.puntosObtenidos,
          tieneLosPuntos: typeof apuesta.puntosObtenidos === 'object' && apuesta.puntosObtenidos.totalGoles >= 2
        });
      } else if (apuesta.totalGolesApuesta === 'mas25') {
        stats.conMas25.push({
          uid: apuesta.uid,
          docId: doc.id,
          totalGolesApuesta: apuesta.totalGolesApuesta,
          puntosObtenidos: apuesta.puntosObtenidos,
          tieneLosPuntos: typeof apuesta.puntosObtenidos === 'object' && apuesta.puntosObtenidos.totalGoles > 0
        });
      }
    });

    const resultado = {
      p21_datos: {
        resultado: "Portugal 1-1 RD Congo",
        totalGolesReal: 2,
        correccion: "Los que apostaron 'menos25' acertaron (2 < 2.5). Los que apostaron 'mas25' fallaron (2 < 2.5)."
      },
      estadisticas: {
        totalApuestasRevisadas: stats.revisadas,
        conMenos25Total: stats.conMenos25.length,
        conMas25Total: stats.conMas25.length
      },
      conMenos25: stats.conMenos25,
      conMas25: stats.conMas25
    };

    res.json(resultado);

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. HTTP: diagnosticarP22 - Diagnosticar p36 (Túnez vs Japón)
// ─────────────────────────────────────────────────────────────────────────────
exports.diagnosticarP22 = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  try {
    const p36Doc = await db.collection('pm_partidos').doc('p36').get();
    if (!p36Doc.exists) {
      return res.json({ error: 'p36 no existe en pm_partidos' });
    }
    const p36 = p36Doc.data();

    const apuestasSnap = await db.collection('pm_apuestas').where('partidoId', '==', 'p36').get();
    const apuestas = [];
    
    for (const doc of apuestasSnap.docs) {
      const a = doc.data();
      const userDoc = await db.collection('pm_usuarios').doc(a.uid).get();
      const userName = userDoc.exists ? userDoc.data().displayName || userDoc.data().nombre || "Sin nombre" : "Sin usuario";
      apuestas.push({
        userName,
        uid: a.uid,
        docId: doc.id,
        prediccion: `${a.golesLocalApuesta}-${a.golesVisitanteApuesta}`,
        totalGolesApuesta: a.totalGolesApuesta,
        puntosObtenidos: a.puntosObtenidos
      });
    }

    res.json({
      partido: {
        id: 'p36',
        equipos: `${p36.equipoLocal} vs ${p36.equipoVisitante}`,
        estado: p36.estado,
        goles: `${p36.golesLocal ?? 'null'}-${p36.golesVisitante ?? 'null'}`,
        fecha: p36.fecha,
        hora: p36.hora
      },
      apuestas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. Trigger de Firestore: onPartidoUpdate
// Recalcula los puntos cuando un partido pasa a finalizado o cambia su marcador
// ─────────────────────────────────────────────────────────────────────────────
exports.onPartidoUpdate = functions.firestore
  .document('pm_partidos/{partidoId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Comprobar si el partido pasó a estado 'finalizado' o si cambió el marcador estando 'finalizado'
    const pasoAFinalizado = before.estado !== 'finalizado' && after.estado === 'finalizado';
    const golesLocalCambiaron = before.golesLocal !== after.golesLocal;
    const golesVisitanteCambiaron = before.golesVisitante !== after.golesVisitante;
    const marcadorCambiado = after.estado === 'finalizado' && (golesLocalCambiaron || golesVisitanteCambiaron);

    if (pasoAFinalizado || marcadorCambiado) {
      const partidoId = context.params.partidoId;
      console.log(`[Trigger] Partido ${partidoId} (${after.equipoLocal} vs ${after.equipoVisitante}) actualizado. Recalculando puntos...`);
      await calcularYGuardarPuntos(partidoId, after);
    }
    return null;
  });



