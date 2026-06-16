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
  "haití": "Haiti", "escocia": "Scotland", "turquía": "Turkey", "curazao": "Curaçao", "japon": "Japan", "costa de marfil": "Ivory Coast", "suecia": "Sweden", "cabo verde": "Cape Verde Islands", "egipto": "Egypt", "nueva zelanda": "New Zealand", "irak": "Iraq", "noruega": "Norway", "argelia": "Algeria", "austria": "Austria", "jordania": "Jordan", "rd congo": "DR Congo", "panamá": "Panama", "uzbekistán": "Uzbekistan", "colombia": "Colombia", "bosnia": "Bosnia-Herzegovina", "bosnia y herzegovina": "Bosnia-Herzegovina", "república checa": "Czechia", "paraguay": "Paraguay", "sudáfrica": "South Africa"
};

// 1. Cron Job: checkAndScoreMatches
exports.checkAndScoreMatches = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('America/Bogota')
  .onRun(async (context) => {
    const ahoraStr = new Date().toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"

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
        // p.fecha -> "SÁB 13-06" -> "13", "06"
        const parts = p.fecha.split(' ');
        if (parts.length < 2) return false;
        const [day, month] = parts[1].split('-');
        const year = 2026;
        
        // p.hora -> "09:00 PM"
        let [time, modifier] = p.hora.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        
        const startTime = new Date(`${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes}:00-05:00`); 
        return startTime <= new Date(); // Only if it already started
      } catch (e) {
        return false;
      }
    });

    if (activeDocs.length === 0) {
      console.log('No hay partidos activos en este momento (todos están en el futuro).');
      return null;
    }

    // 2. Fetch football-data API
    if (!FOOTBALL_DATA_TOKEN) {
      console.error('Missing FOOTBALL_DATA_TOKEN');
      return null;
    }

    // We query from June 10 to catch up on the old matches!
    const today = '2026-06-10';
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];
    let partidosAPI = [];
    
    try {
      const response = await axios.get(
        `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${today}&dateTo=${tomorrow}`,
        { headers: { 'X-Auth-Token': FOOTBALL_DATA_TOKEN } }
      );
      partidosAPI = response.data.matches;
    } catch (e) {
      console.error("Error fetching football-data", e.message);
      return null;
    }

    if (!partidosAPI || partidosAPI.length === 0) {
      console.log('API returned no matches for today/tomorrow.');
      return null;
    }

    // 3. Process matches
    const matchUpdates = [];
    for (const docSnap of activeDocs) {
      const p = docSnap.data();
      const englishHome = teamNameMapping[p.equipoLocal.toLowerCase()] || p.equipoLocal;
      const englishAway = teamNameMapping[p.equipoVisitante.toLowerCase()] || p.equipoVisitante;

      const partidoAPI = partidosAPI.find(pa => 
        pa.homeTeam.name === englishHome && pa.awayTeam.name === englishAway
      );

      if (!partidoAPI) continue;

      const finalizado = partidoAPI.status === 'FINISHED';
      const enVivo = partidoAPI.status === 'IN_PLAY' || partidoAPI.status === 'PAUSED';

      if (!finalizado && !enVivo) continue; // Si está programado (SCHEDULED), ignorar.

      let golesLocal = 0;
      let golesVisitante = 0;
      if (partidoAPI.score && partidoAPI.score.fullTime) {
         // Sometimes fullTime is null if just started, fallback to halfTime or 0
         golesLocal = partidoAPI.score.fullTime.home ?? 0;
         golesVisitante = partidoAPI.score.fullTime.away ?? 0;
      }

      await docSnap.ref.update({
        golesLocal: golesLocal,
        golesVisitante: golesVisitante,
        estado: finalizado ? 'finalizado' : 'en_vivo'
      });

      // 4. Si acaba de finalizar, calcular puntos
      if (finalizado && p.estado !== 'finalizado') {
        const partidoActualizado = { ...p, golesLocal, golesVisitante, estado: 'finalizado' };
        await calcularYGuardarPuntos(docSnap.id, partidoActualizado);
      }
    }

    return null;
  });

// Duplicated calculating logic adapted for node.js
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

  if (apuestasSnap.empty) return;

  const batch = db.batch();
  const userPointsDiff = {};

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

    // Guardar siempre el objeto para el desglose visual en la app, 
    // incluso si el puntaje total obtenido es igual al anterior (ej: 0 y 0)
    batch.update(apuestaDoc.ref, {
        puntosObtenidos: ptsObj
    });

    if (ptsTotal !== ptsAnteriores) {
        const diff = ptsTotal - ptsAnteriores;
        if (!userPointsDiff[a.uid]) userPointsDiff[a.uid] = { total: 0, byGroup: {} };
        userPointsDiff[a.uid].total += diff;
        
        const grupo = a.codigoGrupo || 'LACURVA1';
        userPointsDiff[a.uid].byGroup[grupo] = (userPointsDiff[a.uid].byGroup[grupo] || 0) + diff;
    }
  });

  // Update total points for users
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
}

// 5. Cron Job: sendMatchReminders
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
        const year = 2026; // Adjust if necessary
        
        let [time, modifier] = p.hora.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        
        const startTime = new Date(`${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes}:00-05:00`); 
        
        const diffMs = startTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // Target times: 12h, 2h, 1h. Margin of 0.25h (15 minutes)
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

    // Fetch users with fcmToken and notifications enabled
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
        
        const message = {
          notification: {
            title,
            body,
          },
          tokens: tokens,
        };
        messages.push(admin.messaging().sendEachForMulticast(message));
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

// 6. Callable Function: sendTestNotification
exports.sendTestNotification = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
    }

    try {
        // Verify Auth
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).send({ error: 'Unauthorized' });
            return;
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Ensure user is admin
        const userDoc = await db.collection('pm_usuarios').doc(decodedToken.uid).get();
        if (!userDoc.exists || (!userDoc.data().esAdmin && userDoc.data().email !== 'lfalzatel@gmail.com')) {
            res.status(403).send({ error: 'Forbidden' });
            return;
        }

        // Fetch users to send test to (the user asked for ALL users)
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
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        res.status(200).send({ result: { success: true, delivered: response.successCount } });

    } catch (e) {
        console.error("Error en sendTestNotification:", e);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});
