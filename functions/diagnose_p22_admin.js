const admin = require('firebase-admin');
const serviceAccount = require('./.service-account.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function diagnose() {
  const p22 = await db.collection('pm_partidos').doc('p22').get();
  console.log('=== P22 ===');
  if (!p22.exists) {
    console.log('NO EXISTE');
  } else {
    const d = p22.data();
    console.log({
      estado: d.estado,
      goles: `${d.golesLocal}-${d.golesVisitante}`,
      equipos: `${d.equipoLocal} vs ${d.equipoVisitante}`,
      fecha: d.fecha,
      hora: d.hora
    });
  }

  const p21 = await db.collection('pm_partidos').doc('p21').get();
  console.log('\n=== P21 ===');
  if (p21.exists) {
    const d = p21.data();
    console.log({ estado: d.estado, goles: `${d.golesLocal}-${d.golesVisitante}` });
  }

  const bets22 = await db.collection('pm_apuestas').where('partidoId', '==', 'p22').get();
  console.log(`\n=== APUESTAS P22: ${bets22.size} ===`);
  let sinPts = 0;
  let conPts = 0;
  bets22.forEach(doc => {
    const a = doc.data();
    const total = typeof a.puntosObtenidos === 'number'
      ? a.puntosObtenidos
      : (a.puntosObtenidos?.total || 0);
    if (total > 0) conPts++;
    else sinPts++;
  });
  console.log(`Con puntos: ${conPts}, Sin puntos: ${sinPts}`);

  bets22.docs.slice(0, 5).forEach(doc => {
    const a = doc.data();
    console.log(
      a.uid?.slice(0, 12),
      `${a.golesLocalApuesta}-${a.golesVisitanteApuesta}`,
      JSON.stringify(a.puntosObtenidos)
    );
  });

  const users = await db.collection('pm_usuarios').orderBy('puntosTotal', 'desc').limit(8).get();
  console.log('\n=== TOP USUARIOS ===');
  users.forEach(doc => {
    const u = doc.data();
    console.log(u.nombre, '| total:', u.puntosTotal, '| porGrupo:', JSON.stringify(u.puntosPorGrupo));
  });

  // Partidos recientes finalizados sin puntos en apuestas
  const partidos = await db.collection('pm_partidos').get();
  console.log('\n=== PARTIDOS FINALIZADOS RECIENTES ===');
  partidos.docs
    .filter(d => d.data().estado === 'finalizado')
    .slice(-5)
    .forEach(d => {
      const p = d.data();
      console.log(d.id, p.equipoLocal, p.golesLocal, '-', p.golesVisitante, p.equipoVisitante);
    });
}

diagnose().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
