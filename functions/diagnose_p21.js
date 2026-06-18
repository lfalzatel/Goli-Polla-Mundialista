/**
 * Script de diagnóstico: Analizar TODAS las apuestas de p21 (Portugal)
 * Ejecutar: node diagnose_p21.js
 * 
 * Muestra:
 * - Total de apuestas en p21
 * - Cuántas tienen puntosObtenidos como número
 * - Cuántas como objeto
 * - Detalles de cada usuario
 */

const admin = require('firebase-admin');

// Inicializar Firebase si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function diagnosePorugal() {
  console.log('\n🔍 DIAGNÓSTICO DE APUESTAS - PARTIDO PORTUGAL (p21)\n');

  try {
    // 1. Obtener datos del partido
    const partidoSnap = await db.collection('pm_partidos').doc('p21').get();
    
    if (!partidoSnap.exists) {
      console.log('❌ El partido p21 no existe en la colección pm_partidos');
      console.log('📋 Obteniendo solo apuestas de p21...\n');
    } else {
      const partido = partidoSnap.data();
      console.log('📊 PARTIDO:');
      console.log(`   Portugal vs RD Congo | ${partido.golesLocal || '?'}-${partido.golesVisitante || '?'} | Estado: ${partido.estado || 'desconocido'}`);
      console.log(`   Goles Local: ${partido.golesLocal}, Goles Visitante: ${partido.golesVisitante}\n`);
    }

    // 2. Obtener TODAS las apuestas de p21
    const apuestasSnap = await db.collection('pm_apuestas')
      .where('partidoId', '==', 'p21')
      .get();

    console.log(`📋 TOTAL DE APUESTAS EN P21: ${apuestasSnap.size}\n`);

    // 3. Analizar cada apuesta
    let conNumero = 0;
    let conObjeto = 0;
    const usuarios = {};
    const problematicos = [];

    apuestasSnap.forEach(doc => {
      const apuesta = doc.data();
      const tipoPoints = typeof apuesta.puntosObtenidos;
      
      if (!usuarios[apuesta.uid]) {
        usuarios[apuesta.uid] = {
          uid: apuesta.uid,
          apuestas: []
        };
      }

      const detalles = {
        tipo: tipoPoints,
        valor: apuesta.puntosObtenidos,
        golesLocal: apuesta.golesLocalApuesta,
        golesVisitante: apuesta.golesVisitanteApuesta,
        totalGoles: apuesta.totalGolesApuesta,
        bloqueada: apuesta.bloqueada
      };

      usuarios[apuesta.uid].apuestas.push(detalles);

      if (tipoPoints === 'number') {
        conNumero++;
        problematicos.push({
          uid: apuesta.uid,
          docId: doc.id,
          apuesta
        });
      } else if (tipoPoints === 'object') {
        conObjeto++;
      }
    });

    // 4. Mostrar resumen
    console.log('📈 RESUMEN:');
    console.log(`   ✅ Con objeto (correcto): ${conObjeto}`);
    console.log(`   ❌ Con número (problema): ${conNumero}`);
    console.log(`   Total: ${conObjeto + conNumero}\n`);

    // 5. Mostrar detalles de problemas
    if (problematicos.length > 0) {
      console.log('⚠️  USUARIOS CON PROBLEMA (puntosObtenidos como número):\n');
      
      problematicos.forEach((item, idx) => {
        const apuesta = item.apuesta;
        console.log(`${idx + 1}. UID: ${item.uid}`);
        console.log(`   Predicción: ${apuesta.golesLocalApuesta}-${apuesta.golesVisitanteApuesta}`);
        console.log(`   Total Goles: ${apuesta.totalGolesApuesta || 'ninguno'}`);
        console.log(`   puntosObtenidos: ${apuesta.puntosObtenidos} (tipo: number)`);
        console.log(`   Bloqueada: ${apuesta.bloqueada}`);
        console.log('');
      });
    } else {
      console.log('✅ NO HAY USUARIOS CON PROBLEMA - Todas las apuestas en formato correcto\n');
    }

    // 6. Mostrar detalles de usuarios correctos
    if (conObjeto > 0) {
      console.log(`✅ USUARIOS CON FORMATO CORRECTO (${conObjeto}):\n`);
      
      apuestasSnap.forEach((doc, idx) => {
        const apuesta = doc.data();
        if (typeof apuesta.puntosObtenidos === 'object') {
          console.log(`${idx + 1}. UID: ${apuesta.uid}`);
          console.log(`   Predicción: ${apuesta.golesLocalApuesta}-${apuesta.golesVisitanteApuesta}`);
          console.log(`   Total Goles: ${apuesta.totalGolesApuesta || 'ninguno'}`);
          console.log(`   puntosObtenidos:`, apuesta.puntosObtenidos);
          console.log('');
        }
      });
    }

    // 7. Conclusión
    console.log('─'.repeat(60));
    console.log('CONCLUSIÓN:\n');
    if (conNumero === 0) {
      console.log('✅ No hay problemas. Todas las apuestas están en formato correcto.');
    } else {
      console.log(`❌ ${conNumero} usuario(s) necesitan ser procesado(s):`);
      problematicos.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.uid}`);
      });
      console.log(`\n💡 Estos usuarios deben ser convertidos de número a objeto.`);
    }
    console.log('─'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

diagnosePorugal();
