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
  "cabo verde": "Cape Verde Islands", "egipto": "Egypt", "nueva zelanda": "New Zealand",
  "irak": "Iraq", "noruega": "Norway", "argelia": "Algeria", "austria": "Austria",
  "jordania": "Jordan", "rd congo": "DR Congo", "panamá": "Panama", "uzbekistán": "Uzbekistan",
  "colombia": "Colombia", "bosnia": "Bosnia-Herzegovina", "bosnia y herzegovina": "Bosnia-Herzegovina",
  "república checa": "Czechia", "paraguay": "Paraguay", "sudáfrica": "South Africa"
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
  const today = '2026-06-10';
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

    // Fetch all matches from firestore
    const snapshot = await db.collection('pm_partidos').get();

    const activeDocs = snapshot.docs.filter(doc => {
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
      return null;
    }

    console.log(`[Cron] ${activeDocs.length} partido(s) pendiente(s) de revisión.`);

    // ── Cascada de APIs ──────────────────────────────────────────────────────
    let apiMatches = null;
    let usedSource = '';

    // Intento 1: football-data.org
    apiMatches = await fetchFromFootballData();
    if (apiMatches) {
      usedSource = 'football-data.org';
    }

    // Intento 2: ESPN (fallback gratuito)
    if (!apiMatches) {
      console.log('[Cron] Usando ESPN como fuente de respaldo...');
      apiMatches = await fetchFromESPN();
      if (apiMatches) usedSource = 'ESPN';
    }

    if (!apiMatches) {
      console.error('[Cron] ❌ Todas las APIs fallaron. No se puede actualizar resultados.');
      return null;
    }

    console.log(`[Cron] Fuente utilizada: ${usedSource}`);

    // ── Procesar cada partido activo ─────────────────────────────────────────
    for (const docSnap of activeDocs) {
      const p = docSnap.data();

      const matchFound = findMatchInAPIResults(p, apiMatches);

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

      console.log(`[Cron] ${p.equipoLocal} ${golesLocal}-${golesVisitante} ${p.equipoVisitante} [${matchFound.status}] (${usedSource})`);

      await docSnap.ref.set({
        golesLocal,
        golesVisitante,
        estado: finalizado ? 'finalizado' : 'en_vivo'
      }, { merge: true });

      // Si acaba de finalizar, calcular puntos
      if (finalizado && p.estado !== 'finalizado') {
        const partidoActualizado = { ...p, golesLocal, golesVisitante, estado: 'finalizado' };
        await calcularYGuardarPuntos(docSnap.id, partidoActualizado);
      }
    }

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

    matchPoints[a.uid] = ptsTotal;

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
      batch.set(userRef, updateData, { merge: true });
    }
  }

  await batch.commit();
  console.log(`[Puntos] ✅ Puntos guardados para ${partidoActualizado.equipoLocal} vs ${partidoActualizado.equipoVisitante}. ${Object.keys(matchPoints).length} apuestas procesadas.`);

  await emitirNotificacionesPuntos(partidoActualizado.equipoLocal, partidoActualizado.equipoVisitante, matchPoints);
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
      const pts = matchPoints[user.id] || 0;
      const title = "¡Partido Finalizado!";
      const body = pts > 0
        ? `Has ganado ${pts} puntos en ${equipoLocal} vs ${equipoVisitante}.`
        : `No has ganado puntos en ${equipoLocal} vs ${equipoVisitante}. ¡Suerte en el próximo!`;

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
