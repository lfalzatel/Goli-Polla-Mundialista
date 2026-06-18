const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://green-force-pwa-2025.firebaseio.com"
});

const db = admin.firestore();

async function verificar() {
  try {
    // 1. Verificar p21
    console.log('\n📋 VERIFICANDO P21...\n');
    const p21 = await db.collection('pm_partidos').doc('p21').get();
    if (!p21.exists) {
      console.log('❌ p21 no existe');
      process.exit(0);
    }
    
    const p21Data = p21.data();
    console.log('✅ P21 encontrado:');
    console.log(`   Estado: ${p21Data.estado}`);
    console.log(`   Resultado: ${p21Data.equipoLocal} ${p21Data.golesLocal} - ${p21Data.golesVisitante} ${p21Data.equipoVisitante}`);
    
    // 2. Buscar apuestas de Geiger, Vélez, Darwin en p21
    console.log('\n📋 BUSCANDO APUESTAS DE USUARIOS AFECTADOS EN P21...\n');
    const usuarios = ['2fwWKHeKsQcsyfFcHIrENGFBST02', 'Dv5CziOle9d13MQPrMlxG0Ltkly1', 'HNzawTV6XXS5F9XHBg5C7Rsu3wz2'];
    const nombres = ['Geiger', 'Vélez', 'Darwin'];
    
    for (let i = 0; i < usuarios.length; i++) {
      const uid = usuarios[i];
      const nombre = nombres[i];
      
      const apuesta = await db.collection('pm_apuestas').doc(`${uid}_p21`).get();
      if (!apuesta.exists) {
        console.log(`❌ ${nombre} (${uid}): NO tiene apuesta en p21`);
        continue;
      }
      
      const apuestaData = apuesta.data();
      console.log(`\n✅ ${nombre} (${uid}):`);
      console.log(`   Apuesta: ${apuestaData.golesLocalApuesta}-${apuestaData.golesVisitanteApuesta}`);
      console.log(`   Total Goles: ${apuestaData.totalGolesApuesta}`);
      console.log(`   Puntos Obtenidos tipo: ${typeof apuestaData.puntosObtenidos}`);
      
      if (typeof apuestaData.puntosObtenidos === 'object') {
        console.log(`   Puntos desglose: ${JSON.stringify(apuestaData.puntosObtenidos)}`);
      } else {
        console.log(`   Puntos (número): ${apuestaData.puntosObtenidos}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificar();
