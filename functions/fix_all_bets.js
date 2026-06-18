/**
 * ✅ FIX SCRIPT CONFIABLE - Convertir puntosObtenidos de número a objeto
 * 
 * SEGURO PORQUE:
 * 1. Solo toca apuestas con puntosObtenidos NÚMERO
 * 2. Recalcula EXACTO como la Cloud Function
 * 3. Usa batch para atomicidad
 * 4. Preserva estructura de apuestas bien formadas
 */

const admin = require('firebase-admin');

// ✅ Usar Cloud Functions context - tiene permisos automáticos
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Copiar EXACTAMENTE de src/data.ts
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

  return {
    marcador,
    ganador,
    empate,
    totalGoles,
    total
  };
}

async function fixAllBets() {
  console.log('\n✅ INICIANDO FIX DE APUESTAS CON puntosObtenidos NÚMERO\n');

  const stats = {
    totalApuestas: 0,
    conNumero: 0,
    conObjeto: 0,
    reparadas: 0,
    errores: 0,
    detalles: []
  };

  try {
    // 1. Obtener TODOS los partidos para búsqueda rápida
    console.log('📋 Cargando partidos...');
    const partidosSnap = await db.collection('pm_partidos').get();
    const partidos = {};
    
    partidosSnap.forEach(doc => {
      partidos[doc.id] = doc.data();
    });
    console.log(`✅ ${Object.keys(partidos).length} partidos cargados\n`);

    // 2. Obtener TODAS las apuestas
    console.log('📋 Analizando apuestas...');
    const apuestasSnap = await db.collection('pm_apuestas').get();
    stats.totalApuestas = apuestasSnap.size;

    const batch = db.batch();
    let batchCount = 0;
    const batchSize = 500; // Firestore limit es 500 writes por batch

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
          // 🔧 Recalcular usando EXACTAMENTE la misma lógica de Cloud Function
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

          // 4. Hacer commit cada 500 writes
          if (batchCount >= batchSize) {
            batch.commit().then(() => {
              console.log(`✅ Batch de ${batchCount} apuestas guardado`);
            });
            batchCount = 0;
          }

        } catch (error) {
          stats.errores++;
          stats.detalles.push({
            uid: apuesta.uid,
            partidoId: apuesta.partidoId,
            estado: 'ERROR: ' + error.message
          });
          console.error(`❌ Error procesando ${apuesta.uid}:`, error.message);
        }
      }
    });

    // 5. Commit final
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Batch final de ${batchCount} apuestas guardado`);
    }

    // 6. Reporte
    console.log('\n' + '─'.repeat(60));
    console.log('\n📊 REPORTE FINAL:\n');
    console.log(`Total apuestas revisadas: ${stats.totalApuestas}`);
    console.log(`  ✅ Ya en formato objeto: ${stats.conObjeto}`);
    console.log(`  ⚠️  Encontradas en número: ${stats.conNumero}`);
    console.log(`  🔧 Reparadas exitosamente: ${stats.reparadas}`);
    console.log(`  ❌ Errores: ${stats.errores}\n`);

    if (stats.detalles.length <= 20) {
      console.log('DETALLES:');
      stats.detalles.forEach(d => {
        console.log(`\n  ${d.uid} | ${d.partidoId}: ${d.estado}`);
        if (d.puntosNuevos) {
          console.log(`    Antes: ${d.puntosAntiguos} → Después: ${JSON.stringify(d.puntosNuevos)}`);
        }
      });
    } else {
      console.log(`⚠️  ${stats.detalles.length} cambios registrados (lista muy larga)`);
    }

    console.log('\n' + '─'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  }

  process.exit(0);
}

// Ejecutar
fixAllBets();
