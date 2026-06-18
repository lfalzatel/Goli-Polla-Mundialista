/**
 * Script de emergencia: calcula y guarda los puntos del partido p21 (Portugal 1-1 RD Congo)
 * y recalcula el puntaje total de todos los usuarios.
 * Ejecutar: node functions/fix_portugal.js
 */
const admin = require('firebase-admin');
const serviceAccount = require('./.service-account.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const PARTIDO_ID = 'p21';
const GOLES_LOCAL = 1;   // Portugal
const GOLES_VISITANTE = 1; // RD Congo

function calcularPuntos(golesLocalReal, golesVisitanteReal, golesLocalAp, golesVisitanteAp, totalGolesAp) {
  let marcador = 0, ganador = 0, empate = 0, totalGoles = 0;
  const ganadorReal = golesLocalReal > golesVisitanteReal ? 'local' : golesLocalReal < golesVisitanteReal ? 'visitante' : 'empate';
  const ganadorAp   = golesLocalAp   > golesVisitanteAp   ? 'local' : golesLocalAp   < golesVisitanteAp   ? 'visitante' : 'empate';

  if (golesLocalReal === golesLocalAp && golesVisitanteReal === golesVisitanteAp) {
    marcador = 5;
  } else if (ganadorReal === ganadorAp && ganadorReal !== 'empate' &&
             (golesLocalReal === golesLocalAp || golesVisitanteReal === golesVisitanteAp)) {
    ganador = 3;
  } else if (ganadorReal === ganadorAp && ganadorReal !== 'empate') {
    ganador = 2;
  }

  if (ganadorReal === 'empate' && ganadorAp === 'empate' && marcador === 0) empate = 4;

  const totalGolesReal = golesLocalReal + golesVisitanteReal;
  if (totalGolesAp === 'mas25' && totalGolesReal > 2.5) totalGoles = 2;
  else if (totalGolesAp === 'menos25' && totalGolesReal < 2.5) totalGoles = 2;

  return { marcador, ganador, empate, totalGoles, total: marcador + ganador + empate + totalGoles };
}

async function main() {
  console.log(`\n🔧 Calculando puntos para partido ${PARTIDO_ID} (Portugal ${GOLES_LOCAL}-${GOLES_VISITANTE} RD Congo)\n`);

  // 1. Marcar partido como finalizado
  await db.collection('pm_partidos').doc(PARTIDO_ID).set(
    { estado: 'finalizado', golesLocal: GOLES_LOCAL, golesVisitante: GOLES_VISITANTE },
    { merge: true }
  );
  console.log('✅ Partido p21 actualizado en Firestore');

  // 2. Obtener apuestas del partido
  const apuestasSnap = await db.collection('pm_apuestas').where('partidoId', '==', PARTIDO_ID).get();
  console.log(`📋 ${apuestasSnap.size} apuestas encontradas para el partido\n`);

  if (apuestasSnap.empty) {
    console.log('⚠️ No hay apuestas para este partido.');
    process.exit(0);
  }

  const batch = db.batch();
  const userDiffs = {};

  apuestasSnap.forEach(doc => {
    const a = doc.data();
    const ptsObj = calcularPuntos(
      GOLES_LOCAL, GOLES_VISITANTE,
      a.golesLocalApuesta, a.golesVisitanteApuesta,
      a.totalGolesApuesta
    );

    const ptsAntes = typeof a.puntosObtenidos === 'number'
      ? a.puntosObtenidos
      : (a.puntosObtenidos?.total || 0);

    const diff = ptsObj.total - ptsAntes;

    console.log(`  👤 ${a.uid.substring(0,8)}... | Apuesta: ${a.golesLocalApuesta}-${a.golesVisitanteAp} | Pts: ${ptsAntes} → ${ptsObj.total} (${diff >= 0 ? '+' : ''}${diff})`);

    // Guardar desglose de puntos en apuesta
    batch.set(doc.ref, { puntosObtenidos: ptsObj }, { merge: true });

    if (diff !== 0) {
      const grupo = a.codigoGrupo || 'LACURVA1';
      if (!userDiffs[a.uid]) userDiffs[a.uid] = { total: 0, byGroup: {} };
      userDiffs[a.uid].total += diff;
      userDiffs[a.uid].byGroup[grupo] = (userDiffs[a.uid].byGroup[grupo] || 0) + diff;
    }
  });

  // 3. Actualizar puntos totales de usuarios
  for (const uid of Object.keys(userDiffs)) {
    const diffs = userDiffs[uid];
    const userRef = db.collection('pm_usuarios').doc(uid);
    const updateData = { puntosTotal: admin.firestore.FieldValue.increment(diffs.total) };
    for (const g of Object.keys(diffs.byGroup)) {
      updateData[`puntosPorGrupo.${g}`] = admin.firestore.FieldValue.increment(diffs.byGroup[g]);
    }
    batch.set(userRef, updateData, { merge: true });
    console.log(`\n  ✅ Usuario ${uid.substring(0,8)}... → +${diffs.total} pts totales`);
  }

  await batch.commit();
  console.log('\n🎉 ¡Puntos guardados exitosamente!');
  process.exit(0);
}

main().catch(e => { console.error('❌ Error:', e); process.exit(1); });
