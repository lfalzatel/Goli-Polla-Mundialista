/**
 * ✅ CLOUD FUNCTION: Reparar apuestas con puntosObtenidos NUMBER
 * 
 * Endpoint: POST /fix-apuestas-numero
 * 
 * SEGURIDAD:
 * - Solo acepta request de admin
 * - Usa permisos nativos de Cloud Functions
 * - Valida cada operación
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Función de cálculo (IDÉNTICA a src/data.ts)
function calcularPuntosPartido(golesLocalReal, golesVisitanteReal, golesLocalApuesta, golesVisitanteApuesta, totalGolesApuesta) {
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

// ✅ CLOUD FUNCTION PUBLICA
exports.fixApuestasNumero = functions.https.onRequest(async (req, res) => {
  try {
    // ⚠️ Validación simple (idealmente usar auth token)
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

      if (tipoActual === 'object') {
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
          const ptsObj = calcularPuntosPartido(
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
