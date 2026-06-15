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
        userPointsDiff[a.uid] = (userPointsDiff[a.uid] || 0) + diff;
    }
  });

  // Update total points for users
  for (const uid of Object.keys(userPointsDiff)) {
      const diff = userPointsDiff[uid];
      if (diff !== 0) {
          const userRef = db.collection('pm_usuarios').doc(uid);
          batch.update(userRef, {
             puntosTotal: admin.firestore.FieldValue.increment(diff)
          });
      }
  }

  await batch.commit();
}
