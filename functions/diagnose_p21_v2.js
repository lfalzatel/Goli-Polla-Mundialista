/**
 * Script diagnóstico mejorado - Conectarse al proyecto correcto
 */

const admin = require('firebase-admin');

// Inicializar con el proyecto específico
admin.initializeApp({
  projectId: 'green-force-pwa-2025'
});

const db = admin.firestore();

async function diagnose() {
  console.log('\n🔍 DIAGNÓSTICO P21 - Proyecto: green-force-pwa-2025\n');

  try {
    // 1. Verificar conexión
    console.log('🔗 Conectando a Firestore...');
    const testSnap = await db.collection('pm_partidos').limit(1).get();
    console.log(`✅ Conexión OK. Documentos en pm_partidos: ${testSnap.size}\n`);

    // 2. Obtener todas las apuestas
    console.log('📋 Obteniendo TODAS las apuestas...');
    const allApuestasSnap = await db.collection('pm_apuestas').get();
    console.log(`Total de apuestas en la colección: ${allApuestasSnap.size}\n`);

    // 3. Filtrar p21
    let p21Apuestas = [];
    allApuestasSnap.forEach(doc => {
      if (doc.data().partidoId === 'p21') {
        p21Apuestas.push({
          docId: doc.id,
          ...doc.data()
        });
      }
    });

    console.log(`\n📊 APUESTAS EN P21 (Portugal): ${p21Apuestas.length}\n`);

    if (p21Apuestas.length === 0) {
      console.log('❌ No hay apuestas en p21');
      console.log('\n📝 Primeras 3 apuestas de cualquier partido:');
      
      let count = 0;
      allApuestasSnap.forEach(doc => {
        if (count < 3) {
          const data = doc.data();
          console.log(`\n  ${count + 1}. ${doc.id}`);
          console.log(`     partidoId: ${data.partidoId}`);
          console.log(`     uid: ${data.uid}`);
          console.log(`     puntosObtenidos: ${typeof data.puntosObtenidos === 'object' ? JSON.stringify(data.puntosObtenidos) : data.puntosObtenidos}`);
          count++;
        }
      });
      process.exit(0);
    }

    // 4. Analizar tipos
    let conNumero = 0;
    let conObjeto = 0;

    console.log('DETALLES:');
    p21Apuestas.forEach((apuesta, idx) => {
      const tipo = typeof apuesta.puntosObtenidos;
      
      console.log(`\n${idx + 1}. UID: ${apuesta.uid}`);
      console.log(`   Predicción: ${apuesta.golesLocalApuesta}-${apuesta.golesVisitanteApuesta}`);
      console.log(`   Total Goles: ${apuesta.totalGolesApuesta || 'ninguno'}`);
      console.log(`   puntosObtenidos: ${typeof apuesta.puntosObtenidos === 'object' ? JSON.stringify(apuesta.puntosObtenidos) : apuesta.puntosObtenidos}`);
      console.log(`   Tipo: ${tipo}`);

      if (tipo === 'number') conNumero++;
      if (tipo === 'object') conObjeto++;
    });

    console.log('\n' + '─'.repeat(60));
    console.log(`\n📈 RESUMEN:`);
    console.log(`   ✅ Con objeto (correcto): ${conObjeto}`);
    console.log(`   ❌ Con número (problema): ${conNumero}`);
    console.log(`   Total: ${p21Apuestas.length}`);
    console.log('\n' + '─'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }

  process.exit(0);
}

diagnose();
